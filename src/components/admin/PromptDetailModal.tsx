"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, FileText, Calendar, Box, Tag, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: any;
}

export function PromptDetailModal({ isOpen, onClose, prompt }: PromptDetailModalProps) {
  if (!prompt) return null;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
        />
        <DialogPrimitive.Content 
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-neutral-200 bg-white shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-[1.5rem] dark:border-neutral-800 dark:bg-neutral-950 overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                  Detalles del Prompt
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  Vista completa de las instrucciones generativas.
                </DialogPrimitive.Description>
              </div>
            </div>
            <DialogPrimitive.Close asChild>
              <button className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </DialogPrimitive.Close>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Context Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5"><Box className="w-3 h-3" /> Producto</span>
                <span className="text-sm font-bold truncate" title={prompt.product?.name}>{prompt.product?.name || "N/A"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5"><Tag className="w-3 h-3" /> SKU</span>
                <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">{prompt.product?.sku || "N/A"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5"><Zap className="w-3 h-3" /> Versión</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400">v{prompt.version}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Fecha</span>
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  {new Date(prompt.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Prompt Display */}
            <div className="space-y-3">
              <h3 className="text-sm font-black tracking-widest uppercase text-neutral-900 dark:text-white">Instrucción / Prompt</h3>
              <div className="bg-neutral-900 dark:bg-black text-emerald-400 p-6 rounded-xl font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-inner overflow-x-auto selection:bg-emerald-500/30">
                {prompt.prompt}
              </div>
            </div>

            {/* Notes Display */}
            {prompt.notes && (
              <div className="space-y-3">
                <h3 className="text-sm font-black tracking-widest uppercase text-neutral-900 dark:text-white">Notas / Ajustes</h3>
                <div className="bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm leading-relaxed border border-blue-100 dark:border-blue-900/30">
                  {prompt.notes}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Cerrar Detalles
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
