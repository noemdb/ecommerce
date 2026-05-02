"use client";

import { useEffect, useRef } from "react";
import { useProtectedResource } from "@/hooks/lms/use-protected-resource";

interface ProtectedVideoProps {
  src: string; // URL firmada inicial
  title: string;
  resourceId: string;
}

export function ProtectedVideo({ src, title, resourceId }: ProtectedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { requestUrl, data } = useProtectedResource(resourceId);
  const currentSrc = data?.signedUrl || src;

  // Refrescar cada 240s si el video sigue abierto
  useEffect(() => {
    const interval = setInterval(() => {
      requestUrl();
    }, 240_000);
    return () => clearInterval(interval);
  }, [requestUrl]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        className="h-full w-full object-contain"
        title={title}
        src={currentSrc}
        onError={() => {
          // Si da 403 o error durante reproducción, reintentar obtener URL
          requestUrl();
        }}
      >
        Tu navegador no soporta reproducción de video.
      </video>
    </div>
  );
}
