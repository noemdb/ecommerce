"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import type { ActionResult } from "@/types/actions";

export async function getSuppliers() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  return prisma.supplier.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createSupplier(data: {
  name: string;
  rif?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  commercialTerms?: string;
  isActive?: boolean;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "No autorizado" };
  }

  try {
    await prisma.supplier.create({
      data,
    });
    revalidatePath("/admin/proveedores");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return { success: false, error: "Error al crear el proveedor" };
  }
}

export async function updateSupplier(
  id: string,
  data: {
    name?: string;
    rif?: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    commercialTerms?: string;
    isActive?: boolean;
  }
): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "No autorizado" };
  }

  try {
    await prisma.supplier.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/proveedores");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating supplier:", error);
    return { success: false, error: "Error al actualizar el proveedor" };
  }
}

export async function deleteSupplier(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "No autorizado" };
  }

  try {
    // Nota: El spec dice que Category usa onDelete: Restrict. 
    // Para Supplier el schema dice SetNull, así que se puede borrar.
    await prisma.supplier.delete({
      where: { id },
    });
    revalidatePath("/admin/proveedores");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return { success: false, error: "No se puede eliminar el proveedor porque tiene productos asociados" };
  }
}
