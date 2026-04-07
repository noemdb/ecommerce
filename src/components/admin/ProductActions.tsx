"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { toggleProductActiveAction, deleteProductAction } from "@/actions/product";
import { cn } from "@/lib/utils";

interface ProductActionsProps {
  productId: string;
  isActive: boolean;
  productName: string;
}

export function ProductActions({ productId, isActive, productName }: ProductActionsProps) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();

  function onToggle() {
    startTransition(async () => {
      const res = await toggleProductActiveAction(productId, !isActive);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    });
  }

  async function onDelete() {
    const isConfirmed = await confirm({
      title: "¿Eliminar producto?",
      description: `¿Estás seguro de que deseas eliminar permanentemente "${productName}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!isConfirmed) return;

    startTransition(async () => {
      const res = await deleteProductAction(productId);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={onToggle}
        disabled={isPending}
        title={isActive ? "Desactivar" : "Activar"}
        className={cn(
          "p-2 rounded-lg transition-colors",
          isActive 
            ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" 
            : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        )}
      >
        {isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
      </button>

      <Link
        href={`/admin/productos/${productId}`}
        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
        title="Editar"
      >
        <Pencil className="w-4 h-4" />
      </Link>

      <button
        onClick={onDelete}
        disabled={isPending}
        title="Eliminar"
        className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
