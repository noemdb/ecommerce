import { prisma } from "@/lib/prisma";
import { utapi } from "@/lib/uploadthing";
import { sendCertificateEmail } from "./emails";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
// Importamos un layout básico de certificado. Lo crearemos pronto.
import { CertificateDocument } from "@/components/lms/certificate/CertificateDocument";

export async function issueCertificateIfComplete(customerId: string, courseId: string) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { customerId_courseId: { customerId, courseId } },
    include: {
      customer: { select: { name: true, email: true } },
      course: { select: { title: true, id: true } }
    }
  });

  if (!enrollment || enrollment.progress < 100) return;

  const existing = await prisma.courseCertificate.findUnique({
    where: { customerId_courseId: { customerId, courseId } }
  });

  if (existing) return;

  const verificationCode = `CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // 1. Crear registro inicial sin PDF
  const cert = await prisma.courseCertificate.create({
    data: {
      customerId,
      courseId,
      verificationCode,
    }
  });

  try {
    // 2. Generar PDF
    const stream = await renderToStream(
      <CertificateDocument 
        studentName={enrollment.customer.name}
        courseName={enrollment.course.title}
        date={new Date().toLocaleDateString("es-ES")}
        code={verificationCode}
      />
    );

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as any) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);
    const file = new File([pdfBuffer], `${verificationCode}.pdf`, { type: "application/pdf" });

    // 3. Subir a UploadThing (private ACL)
    const uploadRes = await utapi.uploadFiles(file);

    if (uploadRes.data?.key) {
      // 4. Actualizar registro con la clave
      await prisma.courseCertificate.update({
        where: { id: cert.id },
        data: { certificateKey: uploadRes.data.key }
      });
    }

    // 5. Enviar email
    await sendCertificateEmail(enrollment.customer.email, enrollment.course.title, verificationCode);

  } catch (err) {
    console.error("[issueCertificate] Error generando PDF:", err);
    // El certificado queda creado, pero sin PDF, se puede regenerar luego o manualmente
  }
}
