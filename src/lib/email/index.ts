import { Resend } from "resend";
import { env } from "@/lib/env";
import { OrderPendingTemplate } from "@/lib/email/templates/OrderPending";
import { OrderConfirmedTemplate } from "@/lib/email/templates/OrderConfirmed";
import { OrderRejectedTemplate } from "@/lib/email/templates/OrderRejected";
import { CustomerVerifyEmailTemplate } from "@/lib/email/templates/CustomerVerifyEmail";
import { CustomerPasswordResetTemplate } from "@/lib/email/templates/CustomerPasswordReset";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendOrderPendingEmail(params: {
  orderId: string;
  customerEmail: string;
  customerName: string;
}) {
  const shortId = params.orderId.slice(-8).toUpperCase();
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [params.customerEmail, env.EMAIL_ADMIN],
    subject: `Orden #${shortId} recibida — pendiente de verificación`,
    react: OrderPendingTemplate({ ...params, shortId }),
  });
  if (error) {
    const msg = typeof error === "object" && error !== null
      ? (String((error as any).message ?? "") || JSON.stringify(error))
      : String(error);
    throw new Error(msg || "Resend error");
  }
}

export async function sendOrderConfirmedEmail(params: {
  orderId: string;
  customerEmail: string;
  customerName: string;
}) {
  const shortId = params.orderId.slice(-8).toUpperCase();
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [params.customerEmail],
    subject: `Orden #${shortId} confirmada ✓`,
    react: OrderConfirmedTemplate({ ...params, shortId }),
  });
  if (error) {
    const msg = typeof error === "object" && error !== null
      ? (String((error as any).message ?? "") || JSON.stringify(error))
      : String(error);
    throw new Error(msg || "Resend error");
  }
}

export async function sendOrderRejectedEmail(params: {
  orderId: string;
  customerEmail: string;
  customerName: string;
  reason?: string;
}) {
  const shortId = params.orderId.slice(-8).toUpperCase();
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [params.customerEmail],
    subject: `Orden #${shortId} — acción requerida`,
    react: OrderRejectedTemplate({ ...params, shortId }),
  });
  if (error) {
    const msg = typeof error === "object" && error !== null
      ? (String((error as any).message ?? "") || JSON.stringify(error))
      : String(error);
    throw new Error(msg || "Resend error");
  }
}

export async function sendCustomerVerifyEmail(params: {
  email: string;
  name: string;
  token: string;
}) {
  const verifyUrl = `${env.NEXT_PUBLIC_APP_URL}/registro/verificar?token=${params.token}`;
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [params.email],
    subject: "Verifica tu cuenta",
    react: CustomerVerifyEmailTemplate({ name: params.name, verifyUrl }),
  });
  if (error) {
    const msg = typeof error === "object" && error !== null
      ? (String((error as any).message ?? "") || JSON.stringify(error))
      : String(error);
    throw new Error(msg || "Resend error");
  }
}

export async function sendCustomerPasswordResetEmail(params: {
  email: string;
  name: string;
  token: string;
}) {
  const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/login?reset=true&token=${params.token}`;
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [params.email],
    subject: "Restablecer contraseña",
    react: CustomerPasswordResetTemplate({ name: params.name, resetUrl }),
  });
  if (error) {
    const msg = typeof error === "object" && error !== null
      ? (String((error as any).message ?? "") || JSON.stringify(error))
      : String(error);
    throw new Error(msg || "Resend error");
  }
}
