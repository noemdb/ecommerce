"use server";

import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators/checkout";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendOrderPendingEmail } from "@/lib/email/index";
import type { ActionResult } from "@/types/actions";
import { nanoid } from "nanoid";

console.error("[CHECKOUT_ACTION_FILE] Loaded");

export async function createOrderAction(
  input: unknown,
  items: any[]
): Promise<ActionResult> {
  console.error("[CHECKOUT_ACTION] START - Items:", items?.length);
  
  try {
    const session = await auth().catch(e => {
      console.error("[CHECKOUT_ACTION] Auth Error:", e?.message);
      return null;
    });
    
    const parsed = checkoutSchema.safeParse(input);

    if (!parsed.success) {
      console.error("[CHECKOUT_ACTION] Validation errors:", JSON.stringify(parsed.error.flatten().fieldErrors));
      return {
        success: false,
        error: "Datos de formulario inválidos",
        fieldErrors: JSON.parse(JSON.stringify(parsed.error.flatten().fieldErrors)),
      };
    }

    if (!items || items.length === 0) {
      return { success: false, error: "El carrito está vacío" };
    }

    const { name, email, phone, bankName, paymentReference, receiptUrl } = parsed.data;
    const total = items.reduce((acc, item) => acc + (Number(item.price) * (Number(item.quantity) || 1)), 0);
    const orderNumber = `ORD-${Date.now()}-${nanoid(4).toUpperCase()}`;

    console.error("[CHECKOUT_ACTION] Saving to DB...");
    const order = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { email },
        update: { name, phone },
        create: { name, email, phone, password: null, isEmailVerified: false },
      });

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
              price: Number(item.price),
              quantity: Number(item.quantity),
            })),
          },
          statusHistory: {
            create: { status: "PENDIENTE", note: "Orden creada por el cliente" },
          },
        },
      });

      // Simple stock update
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: Number(item.quantity) } },
        });
      }

      return newOrder;
    });

    console.error("[CHECKOUT_ACTION] Success:", order.id);

    try {
      await sendOrderPendingEmail({
        orderId: order.id,
        customerEmail: email,
        customerName: name,
      });
    } catch (e: any) {
      console.error("[CHECKOUT_ACTION] Email Error (non-fatal):", e?.message);
    }

    try {
      revalidatePath("/cuenta/pedidos");
      revalidatePath("/admin/ordenes");
    } catch (e) {}

    return {
      success: true,
      data: { orderId: order.id },
    };
  } catch (error: any) {
    console.error("[CHECKOUT_ACTION_FATAL]:", error);
    return {
      success: false,
      error: error?.message ? String(error.message) : "Error inesperado",
    };
  }
}
