"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import { X } from "lucide-react";

interface ProductImageCellProps {
  url: string | null;
  name: string;
}

export function ProductImageCell({ url, name }: ProductImageCellProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!url) {
    return (
      <div className="w-11 h-11 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 font-black uppercase tracking-widest border border-neutral-200/50 dark:border-neutral-700/50">
        N/A
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative w-11 h-11 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm hover:ring-4 hover:ring-blue-500/20 active:scale-95 transition-all cursor-zoom-in bg-white dark:bg-neutral-900"
      >
        <Image
          src={url}
          alt={name}
          fill
          sizes="44px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </button>

      <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay 
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
          />
          <DialogPrimitive.Content 
            className="fixed left-[50%] top-[50%] z-[101] w-full max-w-3xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] bg-neutral-50 dark:bg-neutral-950 rounded-[2.5rem] overflow-hidden shadow-2xl focus:outline-none ring-1 ring-white/10"
          >
            <div className="relative w-full aspect-square bg-transparent">
              <Image
                src={url}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain p-8"
                quality={100}
                priority
              />
              
              <div className="absolute top-0 left-0 right-0 p-8 flex items-start justify-between">
                 <div className="bg-black/40 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/10">
                    <DialogPrimitive.Title className="text-white font-black text-xl tracking-tight leading-none">
                      {name}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                      Detalle de Imagen
                    </DialogPrimitive.Description>
                 </div>
                 <DialogPrimitive.Close asChild>
                    <button className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white transition-all focus:outline-none ring-1 ring-white/20 hover:scale-105 active:scale-95 shadow-xl">
                      <X className="w-5 h-5" />
                    </button>
                 </DialogPrimitive.Close>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
