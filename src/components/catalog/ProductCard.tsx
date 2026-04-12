"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import { RatingStars } from "./RatingStars";
import { AddToCartButton } from "./AddToCartButton";
import { useTranslations } from "next-intl";

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
  };
  /**
   * Badge de sección (ej: "NUEVO", "PROMO").
   * Sobreescribe el badge interno de isNew si se provee.
   */
  badge?: string;
}

/**
 * Paleta de fondos para las cards.
 *
 * Cada card toma un color de acento de esta lista de forma determinista
 * (basado en el id del producto), así el grid tiene variedad cromática
 * cohesiva sin ser aleatoria ni repetitiva.
 *
 * Los valores son clases de Tailwind para el gradiente radial CSS.
 * Se definen como variables CSS inline para el gradiente personalizado
 * porque Tailwind no soporta gradientes radiales arbitrarios en v4.
 */
const CARD_ACCENTS = [
  // azul eléctrico — electrónica, tecnología
  { from: "rgba(59,130,246,0.28)", mid: "rgba(37,99,235,0.10)", glow: "rgba(59,130,246,0.18)" },
  // violeta — lujo, moda
  { from: "rgba(139,92,246,0.28)", mid: "rgba(109,40,217,0.10)", glow: "rgba(139,92,246,0.18)" },
  // cian — deportes, tech wearables
  { from: "rgba(6,182,212,0.28)", mid: "rgba(8,145,178,0.10)", glow: "rgba(6,182,212,0.18)" },
  // dorado — premium, joyería
  { from: "rgba(245,158,11,0.28)", mid: "rgba(217,119,6,0.10)", glow: "rgba(245,158,11,0.18)" },
  // esmeralda — salud, naturaleza
  { from: "rgba(16,185,129,0.28)", mid: "rgba(5,150,105,0.10)", glow: "rgba(16,185,129,0.18)" },
  // rosa — lifestyle, beauty
  { from: "rgba(236,72,153,0.28)", mid: "rgba(219,39,119,0.10)", glow: "rgba(236,72,153,0.18)" },
] as const;

/** Selecciona un acento de forma determinista según el id del producto */
function getAccent(id: string) {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CARD_ACCENTS[sum % CARD_ACCENTS.length];
}

export function ProductCard({ product, badge }: ProductCardProps) {
  const t = useTranslations("ProductCard");
  const isOutOfStock = product.stock <= 0;

  const averageRating =
    product.reviews?.length
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : 0;

  const accent = getAccent(product.id);

  return (
    <div className="group relative bg-neutral-950 border border-neutral-800/60 rounded-xl overflow-hidden transition-all duration-300 hover:border-neutral-600/80 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col w-full max-w-[500px] mx-auto">

      {/* ── Link de área completa ── */}
      <Link href={`/producto/${product.slug}`} className="absolute inset-0 z-0">
        <span className="sr-only">Ver {product.name}</span>
      </Link>

      {/* ── Badges ── */}
      <div className="absolute z-10 top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
        {isOutOfStock ? (
          <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
            {t("sold_out")}
          </span>
        ) : (
          <>
            {badge && (
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                {badge}
              </span>
            )}
            {product.promoPrice && (
              <span className="bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/30">
                {t("promo")}
              </span>
            )}
            {product.isNew && !badge && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/30">
                {t("new")}
              </span>
            )}
          </>
        )}
      </div>

      {/* ── Zona de imagen con fondo spotlight ── */}
      <div className="relative aspect-[4/5] overflow-hidden">

        {/*
          Fondo multicapa — de atrás hacia adelante:
          1. Base oscura profunda
          2. Gradiente radial "spotlight" centrado (el color del acento)
          3. Halo de brillo en el borde inferior (efecto rim-light)
          4. Ruido sutil para textura analógica
        */}

        {/* Capa 1: base */}
        <div className="absolute inset-0 bg-neutral-950" />

        {/* Capa 2: spotlight radial — CSS inline porque Tailwind no genera radial arbitrario */}
        <div
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-130"
          style={{
            background: `
              radial-gradient(
                ellipse 75% 70% at 50% 60%,
                ${accent.from} 0%,
                ${accent.mid} 45%,
                transparent 75%
              )
            `,
          }}
        />

        {/* Capa 3: rim light — halo brillante en la base */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3"
          style={{
            background: `
              radial-gradient(
                ellipse 80% 40% at 50% 100%,
                ${accent.glow} 0%,
                transparent 70%
              )
            `,
          }}
        />

        {/* Capa 4: ruido/grain — textura sutil tipo material premium */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        {/* Imagen del producto */}
        {product.images?.[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt ?? product.name}
            fill
            className={`
              relative z-10
              object-contain object-center
              px-6 py-5
              transition-all duration-700
              group-hover:scale-105 group-hover:drop-shadow-[0_8px_32px_rgba(0,0,0,0.6)]
              ${isOutOfStock ? "grayscale opacity-50" : "drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"}
            `}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="relative z-10 w-full h-full flex items-center justify-center text-neutral-600 text-sm">
            Sin imagen
          </div>
        )}

        {/* Separador inferior — línea sutil que marca el corte con la info */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-40"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent.from}, transparent)`,
          }}
        />
      </div>

      {/* ── Contenido inferior ── */}
      <div className="p-5 flex flex-col flex-1 relative z-10 bg-neutral-950 pointer-events-none">

        {/* Reflejo del acento en la esquina superior del content — continuidad visual */}
        <div
          className="absolute top-0 right-0 w-32 h-20 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 100% 0%, ${accent.from}, transparent 70%)`,
          }}
        />

        <h3 className="font-medium text-sm leading-snug line-clamp-2 mb-2 text-neutral-100 group-hover:text-white transition-colors pointer-events-auto">
          <Link href={`/producto/${product.slug}`}>{product.name}</Link>
        </h3>

        {averageRating > 0 && (
          <RatingStars rating={averageRating} count={product.reviews?.length} className="mb-3" />
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pointer-events-auto">
          <div className="flex flex-col">
            {product.promoPrice ? (
              <>
                <span className="text-xs text-neutral-500 line-through leading-none mb-1">
                  {formatPrice(product.price)}
                </span>
                <span className="text-lg font-bold tracking-tight text-blue-400 leading-none">
                  {formatPrice(product.promoPrice)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold tracking-tight text-neutral-100 leading-none">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <AddToCartButton
            product={product as any}
            size="sm"
            showIcon={false}
            className="px-4 pointer-events-auto relative z-20"
          />
        </div>
      </div>
    </div>
  );
}
