import { z } from "zod";

export const checkoutSchema = z.object({
  // Personal Info
  name: z.string().min(3, "Nombre completo requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Teléfono inválido"),
  
  // Bank/Order Info
  bankName: z.string().min(1, "Selecciona tu banco"),
  paymentReference: z.string().min(4, "Referencia de pago requerida"),
  
  // Note: Comprobante will be handled as a URL/String after upload
  receiptUrl: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
