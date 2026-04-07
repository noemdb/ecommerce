export async function sendCustomerVerifyEmail(email: string, token: string) {
  console.log(`[EMAIL_MOCK] Sending verification to ${email} with token ${token}`);
  return Promise.resolve(true);
}

export async function sendOrderConfirmationEmail(email: string, orderNumber: string) {
  console.log(`[EMAIL_MOCK] Sending order confirmation to ${email} for order ${orderNumber}`);
  return Promise.resolve(true);
}
