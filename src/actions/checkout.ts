"use server";

import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators/checkout";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendOrderPendingEmail } from "@/lib/email";
import type { ActionResult } from "@/types/actions";
import { nanoid } from "nanoid";

export async function createOrderAction(
  input: unknown,
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    name: string;
    sku: string;
  }[]
): Promise<ActionResult> {
  const session = await auth();
  const parsed = checkoutSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Datos de formulario inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (!items || items.length === 0) {
    return { success: false, error: "El carrito está vacío" };
  }

  const { name, email, phone, bankName, paymentReference, receiptUrl } = parsed.data;

  try {
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const orderNumber = `ORD-${Date.now()}-${nanoid(4).toUpperCase()}`;

    const order = await prisma.$transaction(async (tx) => {
      // 1. Upsert Customer (G-14: Garantizar registro de cliente para invitados)
      const customer = await tx.customer.upsert({
        where: { email },
        update: {
          name,
          phone,
          // No sobreescribimos address si ya existe y viene vacío
        },
        create: {
          name,
          email,
          phone,
          password: null, // Invitado
          isEmailVerified: false,
        },
      });

      // 2. Create the Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          bankName,
          accountHolder: name,
          referenceNumber: paymentReference,
          transferAmount: total,
          transferDate: new Date(),
          voucherUrl: receiptUrl || null,
          subtotal: total,
          total,
          status: "PENDIENTE",
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId || null,
              name: item.name,
              sku: item.sku,
              price: item.price,
              quantity: item.quantity,
            })),
          },
          // 3. Status History Init
          statusHistory: {
            create: {
              status: "PENDIENTE",
              note: "Orden creada por el cliente",
            },
          },
        },
      });

      // 4. Inventory Movements & Stock Update
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });

        if (!product || product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para el producto: ${item.name}`);
        }

        const stockBefore = product.stock;
        const stockAfter = stockBefore - item.quantity;

        // Actualizar stock del producto
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: stockAfter },
        });

        // Registrar movimiento
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: "SALIDA",
            quantity: item.quantity,
            stockBefore,
            stockAfter,
            reason: `Venta en orden #${orderNumber}`,
            reference: newOrder.id,
          },
        });
      }

      return newOrder;
    });

    // 5. Send Transactional Email
    try {
      await sendOrderPendingEmail({
        orderId: order.id,
        customerEmail: email,
        customerName: name,
      });
    } catch (emailError) {
      console.error("[EMAIL_SEND_ERROR]", emailError);
      // No fallamos la transacción por el email
    }

    revalidatePath("/cuenta/pedidos");
    revalidatePath("/admin/ordenes");

    return {
      success: true,
      message: "Pedido creado correctamente",
      data: { orderId: order.id },
    };
  } catch (error: any) {
    console.error("[CREATE_ORDER_ERROR]", error);
    return {
      success: false,
      error: error.message || "Error al procesar el pedido. Por favor intente de nuevo.",
    };
  }
}
