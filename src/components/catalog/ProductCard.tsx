"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn, formatPrice } from "@/lib/utils";
import { RatingStars } from "./RatingStars";
import { useTranslations } from "next-intl";
import { useCartStore, type CartItem } from "@/store/cart";
import { showPremiumToast } from "@/components/ui/PremiumToast";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    promoPrice: number | null;
    images: { url: string; alt: string | null }[];
    isNew?: boolean;
    stock: number;
    sku: string;
    reviews?: { rating: number }[];
    type?: "PRODUCT" | "SERVICE" | string;
    time?: number | null;
  };
  badge?: string;
  accentIndex?: number; // ✅ NUEVO
}

const CARD_ACCENTS = [
  { from: "rgba(59,130,246,0.5)", mid: "rgba(37,99,235,0.15)", glow: "rgba(59,130,246,0.25)" },
  { from: "rgba(139,92,246,0.5)", mid: "rgba(109,40,217,0.15)", glow: "rgba(139,92,246,0.25)" },
  { from: "rgba(6,182,212,0.5)", mid: "rgba(8,145,178,0.15)", glow: "rgba(6,182,212,0.25)" },
  { from: "rgba(245,158,11,0.5)", mid: "rgba(217,119,6,0.15)", glow: "rgba(245,158,11,0.25)" },
  { from: "rgba(16,185,129,0.5)", mid: "rgba(5,150,105,0.15)", glow: "rgba(16,185,129,0.25)" },
  { from: "rgba(236,72,153,0.5)", mid: "rgba(219,39,119,0.15)", glow: "rgba(236,72,153,0.25)" },
] as const;

function getAccent(id: string) {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CARD_ACCENTS[sum % CARD_ACCENTS.length];
}

export function ProductCard({ product, badge, accentIndex }: ProductCardProps) {
  const t = useTranslations("ProductCard");
  const isOutOfStock = product.stock <= 0;

  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) return;

    const item: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.promoPrice ?? product.price,
      imageUrl: product.images[0]?.url ?? "",
      quantity: 1,
      sku: product.sku,
    };

    addItem(item);
    setAdded(true);
    
    showPremiumToast.cart(
      { name: product.name, image: product.images[0]?.url },
      () => toggleCart()
    );

    setTimeout(() => setAdded(false), 2000);
  };

  const averageRating =
    product.reviews?.length
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : 0;

  const accent =
    accentIndex !== undefined
      ? CARD_ACCENTS[accentIndex % CARD_ACCENTS.length]
      : getAccent(product.id);

  const savings =
    product.promoPrice ? product.price - product.promoPrice : 0;

  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-neutral-950",
        "border border-neutral-200/80 dark:border-neutral-800/60 rounded-xl overflow-hidden",
        "transition-all duration-300",
        "hover:shadow-2xl hover:-translate-y-1 hover:border-[var(--accent)]",
        "h-full flex flex-col w-full max-w-[500px] mx-auto"
      )}
      style={{ "--accent": accent.from } as React.CSSProperties}
    >
      {/* LINK */}
      <Link href={`/producto/${product.slug}`} className="absolute inset-0 z-0" />

      {/* BADGES */}
      <div className="absolute z-20 top-4 left-4 flex flex-col gap-2 pointer-events-none transition-all duration-300 group-hover:translate-x-1 group-hover:translate-y-1">
        {isOutOfStock ? (
          <span className="bg-red-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
            {t("sold_out")}
          </span>
        ) : (
          <>
            {product.type === "SERVICE" && (
              <span className="bg-purple-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-lg border border-purple-500/20 backdrop-blur-sm">
                Servicio • {product.time}h
              </span>
            )}
            {badge && (
              <span className="bg-white/10 border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                {badge}
              </span>
            )}
            {product.promoPrice && (
              <span className="bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                {t("promo")}
              </span>
            )}
          </>
        )}
      </div>

      {/* IMAGE */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <div className="absolute inset-0 z-0 bg-neutral-100 dark:bg-neutral-950" />

        {/* spotlight — siempre detrás de la imagen (z-[1] < z-10 del wrapper) */}
        <div
          className="absolute inset-0 z-[1] opacity-50 transition-opacity duration-500 group-hover:opacity-80"
          style={{
            background: `radial-gradient(ellipse 75% 70% at 50% 60%, ${accent.from} 0%, ${accent.mid} 45%, transparent 75%)`,
          }}
        />

        {/* wrapper de imágenes — siempre encima del spotlight */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-6">

          {/* imagen principal */}
          {product.images?.[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt ?? product.name}
              width={400}
              height={400}
              className={cn(
                "object-contain absolute rounded-[10px]",
                "transition-all duration-700 ease-out",
                // Fade-out solo si hay imagen secundaria que tome su lugar
                product.images?.[1]
                  ? "group-hover:scale-110 group-hover:opacity-0"
                  : "group-hover:scale-105"
              )}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${accent.from}, transparent 80%)`
                }}
              />
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-500 text-center leading-relaxed opacity-40 group-hover:opacity-60 transition-opacity">
                {product.name}
              </span>
            </div>
          )}

          {/* imagen secundaria (hover) — solo renderizada si existe */}
          {product.images?.[1] && (
            <Image
              src={product.images[1].url}
              alt={product.images[1].alt ?? product.name}
              width={400}
              height={400}
              className={cn(
                "object-contain absolute opacity-0 rounded-[10px]",
                "transition-all duration-700 ease-out",
                "group-hover:opacity-100 group-hover:scale-110"
              )}
            />
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col flex-1 bg-white dark:bg-neutral-950 relative z-10">

        <h3 className="font-medium text-sm line-clamp-2 mb-2 text-neutral-800 dark:text-neutral-100 group-hover:text-neutral-900 dark:group-hover:text-white">
          <Link href={`/producto/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* RATING */}
        {averageRating > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <RatingStars rating={averageRating} />
            <span className="text-xs text-neutral-400">
              ({product.reviews?.length})
            </span>
          </div>
        )}

        {/* URGENCIA */}
        {!isOutOfStock && product.stock <= 5 && (
          <span className="text-xs text-orange-400 font-semibold mb-2">
            ¡Quedan {product.stock}!
          </span>
        )}

        <div className="mt-auto flex items-end justify-between gap-3">

          {/* PRICE */}
          <div className="flex flex-col">
            {product.promoPrice ? (
              <>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through">
                  {formatPrice(product.price)}
                </span>

                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(product.promoPrice)}
                </span>

                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Ahorras {formatPrice(savings)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-neutral-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={cn(
              "px-5 py-2.5 rounded-lg font-semibold",
              "transition-all duration-300 active:scale-95 shadow-lg",
              added
                ? "bg-emerald-500 text-white scale-105 animate-[pulse_0.3s_ease]"
                : "bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            )}
          >
            {added ? "✓ Añadido" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}