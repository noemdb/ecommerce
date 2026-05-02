"use client";

import { useState, useTransition } from "react";
import { createSectionAction } from "@/actions/nosotros";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, X } from "lucide-react";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function CreateSectionForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const subtitle = fd.get("subtitle") as string;
    const icon = fd.get("icon") as string;

    startTransition(async () => {
      const result = await createSectionAction({
        title,
        subtitle: subtitle || undefined,
        slug: slugify(title),
        icon: icon || undefined,
      });
      if (result.success) {
        setOpen(false);
      } else {
        setError(result.error ?? "Error desconocido");
      }
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" className="self-start gap-2">
        <Plus className="w-4 h-4" />
        Nueva sección
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-neutral-900 border border-blue-200 dark:border-blue-900 rounded-xl p-5 flex flex-col gap-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900 dark:text-white">Nueva sección</h3>
        <button type="button" onClick={() => setOpen(false)} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <X className="w-4 h-4 text-neutral-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cs-title">Título *</Label>
          <Input id="cs-title" name="title" required placeholder="Ej: Proyectos Destacados" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cs-subtitle">Subtítulo</Label>
          <Input id="cs-subtitle" name="subtitle" placeholder="Ej: Lo que he construido" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cs-icon">Ícono <span className="text-neutral-400">(nombre Lucide)</span></Label>
          <Input id="cs-icon" name="icon" placeholder="Ej: Folder, Star, Code..." />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Crear sección
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
