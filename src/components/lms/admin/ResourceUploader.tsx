"use client";

import { useState } from "react";
import { generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UploadDropzone = generateUploadDropzone<OurFileRouter>();

interface ResourceUploaderProps {
  lessonId: string;
  nextSortOrder: number;
}

export function ResourceUploader({ lessonId, nextSortOrder }: ResourceUploaderProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");

  return (
    <div className="space-y-4 bg-muted/5 p-4 rounded-lg border">
      <h3 className="font-semibold text-lg">Subir Nuevo Recurso</h3>
      
      <div className="grid gap-2">
        <Label htmlFor="resource-title">Título del Recurso</Label>
        <Input 
          id="resource-title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Ej. Presentación PDF" 
        />
        <p className="text-xs text-muted-foreground">Debes asignar un título antes de subir el archivo.</p>
      </div>

      <div className={!title ? "opacity-50 pointer-events-none" : ""}>
        <UploadDropzone
          endpoint="lessonResourceUploader"
          input={{ lessonId, title: title || "Sin título", sortOrder: nextSortOrder }}
          onClientUploadComplete={(res) => {
            toast.success("Recurso subido correctamente");
            setTitle("");
            router.refresh();
          }}
          onUploadError={(error: Error) => {
            toast.error(`Error al subir: ${error.message}`);
          }}
        />
      </div>
    </div>
  );
}
