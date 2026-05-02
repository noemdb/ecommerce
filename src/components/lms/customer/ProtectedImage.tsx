"use client";

import Image from "next/image";

interface ProtectedImageProps {
  src: string;
  title: string;
}

export function ProtectedImage({ src, title }: ProtectedImageProps) {
  return (
    <div className="relative aspect-auto max-h-[80vh] w-full overflow-hidden rounded-lg bg-muted">
      {/* Usamos img en lugar de next/image porque las URLs son firmadas y variables */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title}
        className="h-full w-full object-contain"
        title={title}
      />
    </div>
  );
}
