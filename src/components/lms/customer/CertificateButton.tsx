"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CertificateButtonProps {
  certificateKey: string | null;
  verificationCode: string;
}

export function CertificateButton({ certificateKey, verificationCode }: CertificateButtonProps) {
  if (!certificateKey) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Certificado en proceso...
      </Button>
    );
  }

  // En una app real, aquí haríamos fetch a una Signed URL desde el certificateKey o usaríamos una ruta de descarga
  // Por ahora lo hacemos visualmente indicativo de una acción
  return (
    <div className="space-y-2">
      <a href={`/api/lms/certificate/${verificationCode}`} target="_blank" rel="noopener noreferrer" className="w-full block">
        <Button variant="primary" className="w-full gap-2">
          <Download className="h-4 w-4" />
          Descargar Certificado
        </Button>
      </a>
      <p className="text-xs text-center text-muted-foreground">
        Código: {verificationCode}
      </p>
    </div>
  );
}
