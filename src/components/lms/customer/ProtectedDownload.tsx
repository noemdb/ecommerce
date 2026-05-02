"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedDownloadProps {
  src: string;
  title: string;
}

export function ProtectedDownload({ src, title }: ProtectedDownloadProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border bg-muted/50 p-12">
      <div className="rounded-full bg-primary/10 p-4">
        <Download className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Haz clic para descargar el archivo
        </p>
      </div>
      <a href={src} download={title} target="_blank" rel="noopener noreferrer">
        <Button>Descargar Archivo</Button>
      </a>
    </div>
  );
}
