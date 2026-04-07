"use server";

import { prisma } from "@/lib/prisma";
import { requireCustomerSession } from "@/lib/rbac";
import {
  updateCustomerProfileSchema,
  changePasswordSchema,
} from "@/lib/validators/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import type { ActionResult } from "@/types/actions";

export async function updateCustomerProfileAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireCustomerSession();
  const parsed = updateCustomerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await prisma.$transaction([
    prisma.customer.update({
      where: { id: session.user.id },
      data: parsed.data,
    }),
    prisma.customerAction.create({
      data: {
        customerId: session.user.id,
        action: "UPDATE_PROFILE",
        description: "Perfil actualizado",
      },
    }),
  ]);

  revalidatePath("/cuenta/perfil");
  return { success: true, data: undefined };
}

export async function changeCustomerPasswordAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireCustomerSession();
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!customer?.password)
    return { success: false, error: "Sin contraseña establecida" };

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    customer.password,
  );
  if (!valid) return { success: false, error: "Contraseña actual incorrecta" };

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.$transaction([
    prisma.customer.update({
      where: { id: session.user.id },
      data: { password: hashed },
    }),
    prisma.customerAction.create({
      data: {
        customerId: session.user.id,
        action: "CHANGE_PASSWORD",
        description: "Contraseña actualizada",
      },
    }),
  ]);

  return { success: true, data: undefined };
}

export async function clearCustomerBitacoraAction(): Promise<ActionResult> {
  const session = await requireCustomerSession();
  const customerId = session.user.id;

  await prisma.customerAction.deleteMany({
    where: { customerId },
  });

  // Re-registrar la acción de limpieza
  await prisma.customerAction.create({
    data: {
      customerId,
      action: "UPDATE_PROFILE", // Usar un tipo existente o dejarlo como "Limpieza"
      description: "Bitácora de actividad vaciada por el usuario",
    },
  });

  revalidatePath("/cuenta/bitacora");
  return { success: true, data: undefined };
}

export async function deleteFullAccountAction(): Promise<ActionResult> {
  const session = await requireCustomerSession();
  const customerId = session.user.id;

  // Realizar borrado en cascada manual de lo que no tenga Cascade en schema
  await prisma.$transaction([
    // 1. Borrar órdenes (y sus ítems/historia vía Cascade en DB si existe, si no Prisma lo maneja)
    prisma.order.deleteMany({ where: { customerId } }),
    // 2. Borrar reseñas
    prisma.review.deleteMany({ where: { customerId } }),
    // 3. Borrar el cliente (cascada a CustomerAction)
    prisma.customer.delete({ where: { id: customerId } }),
  ]);

  return { success: true, data: undefined };
}
