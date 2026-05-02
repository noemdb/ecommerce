"use client";

interface ProtectedPdfProps {
  src: string;
  title: string;
}

export function ProtectedPdf({ src, title }: ProtectedPdfProps) {
  return (
    <div className="h-[80vh] w-full overflow-hidden rounded-lg border bg-muted">
      <iframe
        src={`${src}#toolbar=0`}
        title={title}
        className="h-full w-full border-none"
      />
    </div>
  );
}
