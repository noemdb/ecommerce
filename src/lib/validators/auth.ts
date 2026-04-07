import { z } from "zod";

export const customerRegisterSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const updateCustomerProfileSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos").optional().nullable(),
  idDoc: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(8, "La contraseña nueva debe tener al menos 8 caracteres"),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmNewPassword"],
});

export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
