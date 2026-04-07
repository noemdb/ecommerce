"use client";

import { useTransition } from "react";
import { Trash2, ToggleLeft, ToggleRight, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { togglePromptActiveAction, deletePromptAction } from "@/actions/prompt";
import { cn } from "@/lib/utils";

interface PromptActionsProps {
  id: string;
  isActive: boolean;
  productName: string;
}

export function PromptActions({ id, isActive, productName }: PromptActionsProps) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();

  function onToggle() {
    startTransition(async () => {
      const res = await togglePromptActiveAction(id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    });
  }

  async function onDelete() {
    const isConfirmed = await confirm({
      title: "¿Eliminar prompt?",
      description: `¿Estás seguro de que deseas eliminar este prompt para "${productName}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!isConfirmed) return;

    startTransition(async () => {
      const res = await deletePromptAction(id);
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
