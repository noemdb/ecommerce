"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { promptSchema, type PromptInput } from "@/lib/validators/prompt";
import { createPromptAction, updatePromptAction } from "@/actions/prompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { showPremiumToast } from "@/components/ui/PremiumToast";
import { Sparkles, MessageSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptFormProps {
  productId?: string;
  initialData?: any;
  onSuccess?: () => void;
  products?: { id: string, name: string, sku: string }[];
  standalone?: boolean;
}

export function PromptForm({ productId, initialData, onSuccess, products, standalone = true }: PromptFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<PromptInput>({
    resolver: zodResolver(promptSchema),
    defaultValues: initialData ? {
      productId: initialData.productId,
      prompt: initialData.prompt,
      notes: initialData.notes || "",
      isActive: initialData.isActive ?? true,
    } : {
      productId: productId || "",
      prompt: "",
      notes: "",
      isActive: true,
    }
  });

  const onSubmit = (data: PromptInput) => {
    startTransition(async () => {
      const res = initialData 
        ? await updatePromptAction(initialData.id, data)
        : await createPromptAction(data);

      if (res.success) {
        showPremiumToast.success("Prompt guardado", res.message);
        if (onSuccess) onSuccess();
        if (!initialData) reset();
      } else {
        showPremiumToast.error("Error", res.error || "Ocurrió un error");
      }
    });
  };

  const formContent = (
    <>
      <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-lg border border-neutral-100 dark:border-neutral-800 flex flex-col gap-5">
        
        {!productId && products && (
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">
              Seleccionar Producto *
            </label>
            <select
              {...register("productId")}
              className="flex h-12 w-full rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white"
            >
              <option value="">Selecciona un producto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">
                {errors.productId.message}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              Prompt para Mejoramiento de Imagen *
            </label>
          </div>
          <textarea
            {...register("prompt")}
            rows={5}
            placeholder="Ej: High-end lifestyle photography, studio lighting... [Include subject and details]"
            className={cn(
              "flex w-full rounded-md border-2 border-neutral-100 bg-white px-4 py-3 text-sm font-medium transition-all duration-300 placeholder:text-neutral-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white resize-none",
              errors.prompt && "border-red-500"
            )}
          />
          {errors.prompt && (
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">
              {errors.prompt.message}
            </p>
          )}
        </div>

        <Input 
          label="Notas Internas (Opcional)" 
          placeholder="Versión experimental, ajuste de contraste..."
          error={errors.notes?.message}
          {...register("notes")}
        />

        <label className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-md border border-neutral-100 dark:border-neutral-800 cursor-pointer group hover:border-blue-500/30 transition-all">
          <div className="flex flex-col">
            <span className="text-xs font-bold">Activar inmediatamente</span>
            <span className="text-[10px] text-neutral-400 font-medium uppercase truncate">Desactivará otros prompts de este producto</span>
          </div>
          <input
            type="checkbox"
            className="w-5 h-5 rounded-lg border-2 border-neutral-200 dark:border-neutral-800 checked:bg-blue-600 transition-all cursor-pointer accent-blue-600"
            {...register("isActive")}
          />
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button 
          type="button"
          onClick={handleSubmit(onSubmit)}
          isLoading={isPending} 
          className="h-12 px-8 rounded-md gap-2 font-black uppercase tracking-widest text-xs"
        >
          <Sparkles className="w-4 h-4" />
          {initialData ? "Actualizar Prompt" : "Guardar Prompt"}
        </Button>
      </div>
    </>
  );

  if (standalone) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {formContent}
      </form>
    );
  }

  return (
    <div className="space-y-6">
      {formContent}
    </div>
  );
}
