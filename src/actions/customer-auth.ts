"use server";

import { prisma } from "@/lib/prisma";
import { customerRegisterSchema } from "@/lib/validators/auth";
import bcrypt from "bcryptjs";
import { generateVerifyToken } from "@/lib/tokens";
import { sendCustomerVerifyEmail } from "@/lib/email";
import type { ActionResult } from "@/types/actions";

export async function registerCustomerAction(input: unknown): Promise<ActionResult> {
  const parsed = customerRegisterSchema.safeParse(input);
  
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, phone, password } = parsed.data;
  
  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    const hashedPassword = await bcrypt.hash(password, 12);
    const { token, expires } = generateVerifyToken();

    if (existingCustomer) {
      if (existingCustomer.password) {
        return { success: false, error: "Ya existe una cuenta con este email" };
      }
      
      // Convert guest to registered customer
      await prisma.customer.update({
        where: { email },
        data: {
          name,
          phone,
          password: hashedPassword,
          isEmailVerified: false,
          emailVerifyToken: token,
          emailVerifyExpires: expires,
        },
      });

      // Log the registration action for converted guest
      await prisma.customerAction.create({
        data: {
          customerId: existingCustomer.id,
          action: "REGISTER",
          description: "Cuenta creada mediante vinculación de email de invitado",
        },
      });
    } else {
      const newCustomer = await prisma.customer.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          isEmailVerified: false,
          emailVerifyToken: token,
          emailVerifyExpires: expires,
        },
      });

      // Log the registration action
      await prisma.customerAction.create({
        data: {
          customerId: newCustomer.id,
          action: "REGISTER",
          description: "Cuenta creada mediante registro",
        },
      });
    }

    // Log the action (mock for now)
    console.log(`[AUTH] Verification email sent to ${email} with token ${token}`);
    
    // In current spec, we are using email mock
    // await sendCustomerVerifyEmail(email, token);

    return { 
      success: true, 
      message: "Registro exitoso. Revisa tu email para verificar tu cuenta." 
    };

  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return { success: false, error: "Error interno del servidor" };
  }
}
