// Importa tu cliente de resend o equivalente.
// Aquí usamos una estructura stub para el envío de correos,
// asumiendo que tienes configurado algo similar.

export async function sendEnrollmentEmail(email: string, courseTitle: string) {
  console.log(`[Email Mock] Matrícula enviada a ${email} para ${courseTitle}`);
  // Implementación real de Resend:
  // await resend.emails.send({
  //   from: 'Acme <onboarding@resend.dev>',
  //   to: email,
  //   subject: `Bienvenido al curso: ${courseTitle}`,
  //   html: `<p>Te has matriculado exitosamente en <strong>${courseTitle}</strong>. Inicia sesión en tu cuenta para empezar.</p>`
  // });
}

export async function sendCertificateEmail(email: string, courseTitle: string, verificationCode: string) {
  console.log(`[Email Mock] Certificado de ${courseTitle} enviado a ${email}. Código: ${verificationCode}`);
  // Implementación real de Resend:
  // await resend.emails.send({
  //   from: 'Acme <onboarding@resend.dev>',
  //   to: email,
  //   subject: `¡Felicidades! Aquí está tu certificado de ${courseTitle}`,
  //   html: `<p>Has completado el curso <strong>${courseTitle}</strong>.</p>
  //          <p>Tu código de certificado es: <strong>${verificationCode}</strong></p>
  //          <p>Puedes descargarlo desde tu panel de estudiante.</p>`
  // });
}
