"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { purgeCustomerAction } from "@/actions/customer-admin";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/ConfirmProvider";

interface PurgeCustomerButtonProps {
  customerId: string;
}

export function PurgeCustomerButton({ customerId }: PurgeCustomerButtonProps) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();

  const handlePurge = async () => {
    const isConfirmed = await confirm({
      title: "Confirmar Purga GDPR",
      description: "Esta acción es IRREVERSIBLE. Se borrarán permanentemente los datos personales, reseñas y bitácora del cliente, y sus órdenes serán anonimizadas sin posibilidad de recuperación. Escribe 'PURGAR' para confirmar.",
      confirmText: "Purgar Datos",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!isConfirmed) return;

    startTransition(async () => {
      const res = await purgeCustomerAction(customerId);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error || "No se pudo realizar la purga.");
      }
    });
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={handlePurge}
      disabled={isPending}
    >
      <Trash2 className="w-3.5 h-3.5" />
      Purgar
    </Button>
  );
}
