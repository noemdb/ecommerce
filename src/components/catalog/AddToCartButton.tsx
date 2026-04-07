"use client";

import { useCartStore, CartItem } from "@/store/cart";
import { Plus, Check, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    promoPrice: number | null;
    images: { url: string; alt?: string | null }[];
    sku: string;
    stock: number;
  };
  variantId?: string;
  disabled?: boolean;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AddToCartButton({ 
  product, 
  variantId, 
  disabled,
  className, 
  showIcon = true,
  size = "md" 
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0 || disabled) return;

    const item: CartItem = {
      productId: product.id,
      variantId,
      name: product.name,
      price: product.promoPrice ?? product.price,
      imageUrl: product.images[0]?.url ?? "",
      quantity: 1,
      sku: product.sku,
    };

    addItem(item);
    setAdded(true);
    toast.success(`${product.name} añadido al carrito`, {
      action: {
        label: "Ver carrito",
        onClick: () => toggleCart(),
      },
    });

    setTimeout(() => setAdded(false), 2000);
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  return (
    <button
      onClick={handleAdd}
      disabled={product.stock <= 0 || disabled}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        added 
          ? "bg-emerald-500 text-white" 
          : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 active:scale-95 shadow-sm",
        className
      )}
    >
      {added ? (
        <>
          <Check className="w-4 h-4" />
          <span>Añadido</span>
        </>
      ) : (
        <>
          {showIcon && <Plus className="w-4 h-4" />}
          <span>{(product.stock <= 0 || disabled) ? "Agotado" : "Añadir"}</span>
        </>
      )}
    </button>
  );
}
