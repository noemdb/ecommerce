"use server";

import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators/checkout";
import { auth } from "@/auth";
import type { ActionResult } from "@/types/actions";
import { nanoid } from "nanoid";

export async function createOrderAction(
  input: unknown,
  items: { productId: string; variantId?: string; quantity: number; price: number; name: string; sku: string }[]
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
      // 1. Create the order with all required fields from schema
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          
          bankName,
          accountHolder: name, // Default to customer name
          referenceNumber: paymentReference,
          transferAmount: total,
          transferDate: new Date(),
          voucherUrl: receiptUrl || undefined,

          subtotal: total,
          total,
          status: "PENDIENTE",
          
          customerId: session?.user?.role === "CUSTOMER" ? session.user.id : null,
          
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId || undefined,
              name: item.name,
              sku: item.sku,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
      });

      // 2. Reduce stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return {
      success: true,
      message: "Pedido creado correctamente",
      data: { orderId: order.id },
    };

  } catch (error) {
    console.error("[CREATE_ORDER_ERROR]", error);
    return { success: false, error: "Error al procesar el pedido." };
  }
}
