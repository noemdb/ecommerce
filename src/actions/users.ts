"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import type { ActionResult } from "@/types/actions";

export async function getUsers() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "STAFF";
}): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "No autorizado" };
  }

  try {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });
    revalidatePath("/admin/usuarios");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Error al crear el usuario. ¿Email duplicado?" };
  }
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    role?: "ADMIN" | "STAFF";
    isActive?: boolean;
  }
): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "No autorizado" };
  }

  try {
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/admin/usuarios");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Error al actualizar el usuario" };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "No autorizado" };
  }

  // Prevenir borrarte a ti mismo
  if (session.user.id === id) {
    return { success: false, error: "No puedes eliminar tu propia cuenta" };
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath("/admin/usuarios");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Error al eliminar el usuario" };
  }
}
