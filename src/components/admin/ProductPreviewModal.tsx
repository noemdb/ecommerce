"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Eye, Smartphone, Layout, Monitor, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductDetailView } from "@/components/catalog/ProductDetailView";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
}

interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productData: any;
  categories: Category[];
}

export function ProductPreviewModal({ isOpen, onClose, productData, categories }: ProductPreviewModalProps) {
  const [viewType, setViewType] = React.useState<"card" | "detail">("card");
  const [deviceMode, setDeviceMode] = React.useState<"desktop" | "mobile">("desktop");

  const currentCategory = categories.find(c => c.id === productData.categoryId);

  // Map form data to Product structure
  const productForPreview = {
    id: "preview-id",
    name: productData.name || "Nombre del Producto",
    slug: productData.slug || "slug-producto",
    description: productData.description || "",
    price: Number(productData.price) || 0,
    promoPrice: productData.promoPrice ? Number(productData.promoPrice) : null,
    stock: Number(productData.stock) || 0,
    categoryId: productData.categoryId,
    category: { name: currentCategory?.name || "Categoría" },
    images: productData.images?.length > 0 
      ? productData.images.map((url: string, index: number) => ({ 
          id: `img-${index}`, 
          url, 
          alt: productData.name,
          isPrimary: index === 0
        }))
      : [],
    isNew: productData.isNew,
    sku: productData.sku || "PROD-000",
    reviews: [] // Mock reviews
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
        />
        <DialogPrimitive.Content 
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-0 border border-neutral-200 bg-neutral-50 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-[2rem] dark:border-neutral-800 dark:bg-neutral-950 overflow-hidden transition-all",
            viewType === "card" ? "max-w-4xl" : "max-w-[95vw] h-[90vh]"
          )}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-blue-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                  Vista Previa
                </DialogPrimitive.Title>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  Visualiza el producto antes de guardar los cambios.
                </p>
              </div>
            </div>

            {/* View Toggles */}
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-md">
              <button 
                onClick={() => setViewType("card")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  viewType === "card" ? "bg-white dark:bg-neutral-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                )}
              >
                <Layout className="w-3.5 h-3.5" />
                Catálogo (Card)
              </button>
              <button 
                onClick={() => setViewType("detail")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  viewType === "detail" ? "bg-white dark:bg-neutral-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                )}
              >
                <ScrollText className="w-3.5 h-3.5" />
                Detalle (Página)
              </button>
            </div>

            {/* Device Toggles */}
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-md">
              <button 
                onClick={() => setDeviceMode("desktop")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  deviceMode === "desktop" ? "bg-white dark:bg-neutral-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                )}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setDeviceMode("mobile")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  deviceMode === "mobile" ? "bg-white dark:bg-neutral-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                )}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            <DialogPrimitive.Close asChild>
              <button className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </DialogPrimitive.Close>
          </div>

          {/* Content Area */}
          <div className={cn(
            "flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-900/50 p-6 sm:p-12 flex items-start justify-center",
            viewType === "detail" && "p-0"
          )}>
            <div className={cn(
              "transition-all duration-500 ease-in-out bg-white dark:bg-neutral-900 shadow-xl overflow-hidden",
              viewType === "card" && deviceMode === "desktop" && "w-72 rounded-md",
              viewType === "card" && deviceMode === "mobile" && "w-[320px] rounded-md",
              viewType === "detail" && deviceMode === "desktop" && "w-full min-h-full",
              viewType === "detail" && deviceMode === "mobile" && "w-[400px] min-h-full border-x dark:border-neutral-800"
            )}>
               {viewType === "card" ? (
                 <ProductCard product={productForPreview as any} />
               ) : (
                 <div className="p-8 sm:p-20">
                    <ProductDetailView product={productForPreview as any} isPreview />
                 </div>
               )}
            </div>
          </div>

          {/* Footer info */}
          <div className="p-3 bg-blue-600 text-white text-center">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none">
              Modo Visualización • Verifica el diseño en diferentes dispositivos
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
