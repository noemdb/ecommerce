"use client";

import { useState, useTransition } from "react";
import { adjustStockAction } from "@/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ArrowUpCircle, ArrowDownCircle, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StockAdjustmentModalProps {
  product: {
    id: string;
    name: string;
    sku: string;
    stock: number;
  };
  onClose: () => void;
}

export function StockAdjustmentModal({ product, onClose }: StockAdjustmentModalProps) {
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"ENTRADA" | "SALIDA" | "AJUSTE">("ENTRADA");
  const [quantity, setQuantity] = useState<string>("0");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity);

    if (isNaN(qty) || qty < 0) {
      toast.error("La cantidad debe ser un número positivo");
      return;
    }

    if (type === "SALIDA" && qty > product.stock) {
      toast.error("No puedes retirar más de lo que hay en stock");
      return;
    }

    startTransition(async () => {
      const result = await adjustStockAction({
        productId: product.id,
        quantity: qty,
        type,
        reason: reason || undefined,
      });

      if (result.success) {
        toast.success("Inventario actualizado correctamente");
        onClose();
      } else {
        toast.error(result.error || "Ocurrió un error");
      }
    });
  };

  const types = [
    { id: "ENTRADA", label: "Entrada", icon: ArrowUpCircle, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { id: "SALIDA", label: "Salida", icon: ArrowDownCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
    { id: "AJUSTE", label: "Ajuste Manual", icon: RefreshCw, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
  ] as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold">Ajustar Inventario</h2>
            <p className="text-xs text-neutral-500">{product.name} ({product.sku})</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {/* Current Stock Badge */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-md flex items-center justify-between border border-neutral-100 dark:border-neutral-800">
            <span className="text-sm font-medium text-neutral-500">Stock Actual</span>
            <span className="text-2xl font-black">{product.stock}</span>
          </div>

          {/* Type Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Tipo de Movimiento</label>
            <div className="grid grid-cols-3 gap-2">
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-md border-2 transition-all",
                    type === t.id 
                      ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900" 
                      : "border-neutral-100 bg-white text-neutral-500 hover:border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800"
                  )}
                >
                  <t.icon className={cn("w-5 h-5", type === t.id ? "text-current" : t.color)} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Input
            label={type === "AJUSTE" ? "Nuevo Stock Total" : "Cantidad"}
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            required
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Motivo (Opcional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Reposición de mercancía, error de conteo..."
              className="flex w-full rounded-md border-2 border-neutral-100 bg-white px-4 py-3 text-sm font-medium transition-all duration-300 placeholder:text-neutral-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white dark:placeholder:text-neutral-600 resize-none h-20"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
