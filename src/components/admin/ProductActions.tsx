"use client";

import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { Pencil, ToggleLeft, ToggleRight, Trash2, Eye } from "lucide-react";
import { showPremiumToast } from "@/components/ui/PremiumToast";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { toggleProductActiveAction, deleteProductAction } from "@/actions/product";
import { cn } from "@/lib/utils";
import { ProductPreviewModal } from "./ProductPreviewModal";

interface ProductActionsProps {
  productId: string;
  isActive: boolean;
  productName: string;
  product: any;
  categories: any[];
}

export function ProductActions({ productId, isActive, productName, product, categories }: ProductActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const confirm = useConfirm();

  function onToggle() {
    startTransition(async () => {
      const res = await toggleProductActiveAction(productId, !isActive);
      if (res.success) {
        showPremiumToast.success("Estado actualizado", res.message);
      } else {
        showPremiumToast.error("Error", res.error);
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
        showPremiumToast.success("¡Eliminado!", res.message);
      } else {
        showPremiumToast.error("Error al eliminar", res.error);
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="flex items-center -space-x-px bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setIsPreviewOpen(true)}
          title="Vista Previa"
          className="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors border-r border-neutral-200 dark:border-neutral-800 last:border-r-0"
        >
          <Eye className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={onToggle}
          disabled={isPending}
          title={isActive ? "Desactivar" : "Activar"}
          className={cn(
            "p-2.5 transition-colors border-r border-neutral-200 dark:border-neutral-800 last:border-r-0",
            isActive 
              ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" 
              : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          )}
        >
          {isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
        </button>

        <Link
          href={`/admin/productos/${productId}`}
          className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors border-r border-neutral-200 dark:border-neutral-800 last:border-r-0"
          title="Editar"
        >
          <Pencil className="w-4 h-4" />
        </Link>

        <button
          onClick={onDelete}
          disabled={isPending}
          title="Eliminar"
          className="p-2.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-r border-neutral-200 dark:border-neutral-800 last:border-r-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <ProductPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        productData={{
          ...product,
          images: product.images?.map((img: any) => img.url) || []
        }}
        categories={categories}
      />
    </div>
  );
}
