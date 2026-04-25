"use client";

import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/lib/uploadthing";
import { Input } from "@/components/ui/input";
import { X, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploadFieldProps {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  endpoint: "siteConfigImage";
}

export function ImageUploadField({ label, name, defaultValue = "", error, endpoint }: ImageUploadFieldProps) {
  const [url, setUrl] = useState(defaultValue);
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      
      <div className="flex items-start gap-4 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        {/* Preview */}
        <div className="relative w-20 h-20 rounded-md border border-neutral-100 dark:border-neutral-800 overflow-hidden bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center shrink-0">
          {url ? (
            <>
              <Image src={url} alt={label} fill className="object-contain" />
              <button
                type="button"
                onClick={() => setUrl("")}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <ImageIcon className="w-8 h-8 text-neutral-300" />
          )}
        </div>

        {/* Upload & Input */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <UploadButton<OurFileRouter, any>
              endpoint={endpoint}
              onUploadBegin={() => setIsUploading(true)}
              onClientUploadComplete={(res: any) => {
                const newUrl = res[0].ufsUrl || res[0].url;
                setUrl(newUrl);
                setIsUploading(false);
                toast.success("Imagen subida correctamente");
              }}
              onUploadError={(error: Error) => {
                setIsUploading(false);
                toast.error(`Error al subir: ${error.message}`);
              }}
              appearance={{
                button: "bg-indigo-600 hover:bg-indigo-700 text-sm h-9 px-4 rounded-md",
                allowedContent: "hidden",
              }}
              content={{
                button: isUploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subiendo...
                  </div>
                ) : (
                  "Subir Imagen"
                ),
              }}
            />
          </div>

          <div className="relative">
            <Input
              id={name}
              name={name}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="text-xs h-8 pr-8"
              error={error}
            />
            {url && (
              <div className="absolute right-2 top-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-1 rounded border border-emerald-200 dark:border-emerald-800">
                URL VÁLIDA
              </div>
            )}
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
