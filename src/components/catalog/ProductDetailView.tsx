"use client";

import { 
  motion, 
  useReducedMotion, 
  useMotionValue, 
  useSpring, 
  useTransform 
} from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { RatingStars } from "./RatingStars";
import { AddToCartButton } from "./AddToCartButton";
import { formatPrice } from "@/lib/utils";
import { Package, ShieldCheck, Truck, ArrowLeft, MessageSquare, Star, Headset, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductDetailViewProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    promoPrice: number | null;
    stock: number;
    categoryId: string;
    sku: string;
    category?: { name: string };
    images: { id: string; url: string; alt?: string | null; isPrimary?: boolean }[];
    isNew?: boolean;
    reviews: { id: string; rating: number; comment: string; createdAt: Date | string }[];
    type?: string;
    time?: number | null;
  };
  isPreview?: boolean;
}

const CARD_ACCENTS = [
  { from: "rgba(59,130,246,0.3)", mid: "rgba(37,99,235,0.1)", glow: "rgba(59,130,246,0.2)" },
  { from: "rgba(139,92,246,0.3)", mid: "rgba(109,40,217,0.1)", glow: "rgba(139,92,246,0.2)" },
  { from: "rgba(6,182,212,0.3)", mid: "rgba(8,145,178,0.1)", glow: "rgba(6,182,212,0.2)" },
  { from: "rgba(245,158,11,0.3)", mid: "rgba(217,119,6,0.1)", glow: "rgba(245,158,11,0.2)" },
  { from: "rgba(16,185,129,0.3)", mid: "rgba(5,150,105,0.1)", glow: "rgba(16,185,129,0.2)" },
  { from: "rgba(236,72,153,0.3)", mid: "rgba(219,39,119,0.1)", glow: "rgba(236,72,153,0.2)" },
] as const;

function getAccent(id: string) {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CARD_ACCENTS[sum % CARD_ACCENTS.length];
}

export function ProductDetailView({ product, isPreview = false }: ProductDetailViewProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0;

  const accent = getAccent(product.id);
  const shouldReduceMotion = useReducedMotion();

  const isService = product.type === "SERVICE" || (product as any).type === "SERVICE";

  const trustBadges = isService ? [
    {
      title: "Soporte",
      description: "Durante el transcurso del curso",
      icon: Headset,
    },
    {
      title: "Atención",
      description: "Preferencia",
      icon: Sparkles,
    }
  ] : [
    {
      title: "Garantía Real",
      description: "12 meses de soporte",
      icon: ShieldCheck,
    },
    {
      title: "Envío Seguro",
      description: "Verificado manualmente",
      icon: Truck,
    }
  ];

  // 👇 PREMIUM PARALLAX SYSTEM
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const translateX = useTransform(springX, [-0.5, 0.5], [-15, 15]);
  const translateY = useTransform(springY, [-0.5, 0.5], [-15, 15]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-3, 3]);

  return (
    <div className={cn("container mx-auto px-4 py-8", isPreview && "py-0 px-0 max-w-none")}>
      {!isPreview && (
        <Link 
          href="/#catalogo" 
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al catálogo
        </Link>
      )}

      <div className={cn(
        "grid grid-cols-1 gap-12 lg:gap-16",
        !isPreview ? "lg:grid-cols-2" : "@lg:grid-cols-2 gap-4 @sm:gap-6 @lg:gap-10"
      )}>
        {/* Left: Gallery */}
        <div 
          className="space-y-4"
          onMouseMove={(e) => {
            if (shouldReduceMotion) return;
            const rect = e.currentTarget.getBoundingClientRect();
            mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
            mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
          }}
          onMouseLeave={() => {
            mouseX.set(0);
            mouseY.set(0);
          }}
        >
          <div className="aspect-square relative bg-white dark:bg-neutral-950 rounded-[2.5rem] overflow-hidden border dark:border-neutral-800 shadow-2xl group flex items-center justify-center">
            
            {/* Spotlight Background (ProductCard Style) */}
            <div 
              className="absolute inset-0 z-0 opacity-60 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${accent.from} 0%, ${accent.mid} 45%, transparent 75%)`
              }}
            />

            <motion.div 
              className="relative z-10 w-full h-full p-12"
              style={{
                x: shouldReduceMotion ? 0 : translateX,
                y: shouldReduceMotion ? 0 : translateY,
                rotateX: shouldReduceMotion ? 0 : rotateX,
                rotateY: shouldReduceMotion ? 0 : rotateY,
                transformPerspective: 1000,
              }}
            >
              {primaryImage ? (
                <Image 
                  src={primaryImage.url} 
                  alt={primaryImage.alt || product.name} 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain drop-shadow-2xl" 
                  priority
                />
              ) : (
                  <div className="w-full h-full flex items-center justify-center p-12 bg-neutral-100 dark:bg-neutral-900/50 relative overflow-hidden rounded-3xl">
                  <div 
                    className="absolute inset-0 opacity-10 animate-pulse"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, #3b82f6, transparent 70%), radial-gradient(circle at 70% 70%, #8b5cf6, transparent 70%)`
                    }}
                  />
                  <span className="relative z-10 text-xs font-black uppercase tracking-[0.4em] text-neutral-400 dark:text-neutral-500 text-center leading-loose opacity-30 select-none">
                    {product.name}
                  </span>
                </div>
            )}
          </motion.div>
            
            {product.isNew && (
              <span className="absolute top-6 left-6 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                Novedad
              </span>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image) => (
                <div 
                  key={image.id} 
                  className={cn(
                    "aspect-square relative rounded-md overflow-hidden border-2 cursor-pointer transition-all",
                    image.id === primaryImage?.id ? "border-blue-600 shadow-md" : "border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                  )}
                >
                  <Image src={image.url} alt={image.alt || product.name} fill sizes="(max-width: 768px) 25vw, 15vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                {product.category?.name || "Categoría"}
              </span>
              {(product.type === "SERVICE" || (product as any).type === "SERVICE") && (
                <span className="text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-lg">
                  Servicio | Duración: {product.time}Hrs
                </span>
              )}
            </div>
            <h1 className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-4 text-neutral-900 dark:text-white leading-[1.1]",
              !isPreview ? "" : "@lg:text-4xl @2xl:text-5xl",
              isPreview && "text-xl sm:text-2xl lg:text-3xl @sm:text-2xl @lg:text-3xl mb-2"
            )}>
              {product.name || "Nombre del Producto"}
            </h1>
            <div className={cn(
              "flex flex-wrap items-center gap-4 text-sm",
              isPreview && "gap-2 text-xs @sm:text-sm"
            )}>
              <div className="flex items-center gap-2">
                <RatingStars rating={avgRating} />
                <span className="font-bold text-neutral-900 dark:text-neutral-200">{avgRating.toFixed(1)}</span>
                {!isPreview && <span className="text-neutral-400">({product.reviews.length} reseñas)</span>}
              </div>
              <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />
              <div className={cn("flex items-center gap-2 font-bold", product.stock > 0 ? "text-emerald-600" : "text-red-500")}>
                <Package className="w-4 h-4" />
                {product.stock > 0 ? "En Stock" : "Agotado"}
              </div>
            </div>
          </div>

          <div className={cn(
            "mb-8 p-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border dark:border-neutral-800",
            isPreview && "mb-5 p-4 sm:p-5"
          )}>
            <div className={cn(
              "flex items-baseline gap-4 mb-6",
              isPreview && "mb-4 gap-2"
            )}>
              <span className={cn(
                "text-4xl font-black tracking-tighter text-blue-600",
                isPreview && "text-3xl"
              )}>
                {formatPrice(product.promoPrice || product.price)}
              </span>
              {product.promoPrice && (
                <span className={cn(
                  "text-xl text-neutral-400 line-through font-medium italic opacity-60",
                  isPreview && "text-lg"
                )}>
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            
            <AddToCartButton 
              product={product as any}
              variantId={product.id} 
              disabled={product.stock <= 0 || isPreview}
              className="w-full h-16 text-lg rounded-md shadow-xl shadow-blue-500/20"
            />
            
            <p className="text-[10px] text-center text-neutral-400 mt-4 uppercase tracking-[0.2em] font-bold">
              {isService ? "Garantía de aprendizaje y satisfacción asegurada" : "Garantía de satisfacción y pago seguro"}
            </p>
          </div>

          <div className="space-y-6 flex-1">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-2">Descripción</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-base italic">
                {product.description || "Este producto premium ha sido cuidadosamente seleccionado para ofrecer la mejor experiencia en su categoría."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t dark:border-neutral-800">
              {trustBadges.map((badge, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500">
                    <badge.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase">{badge.title}</h4>
                    <p className="text-[10px] text-neutral-500">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section - Simplified for Preview */}
      <section className="mt-20 pt-20 border-t dark:border-neutral-800 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-10">
            <MessageSquare className="w-8 h-8 text-neutral-300" />
            <h2 className="text-3xl font-black tracking-tighter">Experiencias de Clientes</h2>
          </div>

          {product.reviews.length === 0 ? (
            <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-12 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800">
              <p className="text-neutral-500 font-medium mb-2 italic">Aún no hay reseñas para este producto.</p>
              <p className="text-xs text-neutral-400">Sé el primero en compartir tu experiencia premium.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="p-6 bg-neutral-50 dark:bg-neutral-900/30 rounded-lg border dark:border-neutral-800 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <RatingStars rating={review.rating} />
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium italic text-sm">
                    "{review.comment}"
                  </p>
                  <div className="mt-auto flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-neutral-200 flex items-center justify-center text-[10px] font-bold">
                      C
                    </div>
                    <span className="text-xs font-bold text-neutral-500 uppercase">Cliente Verificado</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isPreview && (
            <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-[2.5rem] p-10 border border-neutral-100 dark:border-neutral-800 text-center space-y-4 shadow-xl shadow-blue-500/5">
                <h3 className="text-xl font-black tracking-tight">Comparte tu opinión</h3>
                <p className="text-sm text-neutral-500 italic">Inicia sesión con tu cuenta premium para dejar una reseña sobre este producto.</p>
            </div>
        )}
      </section>
    </div>
  );
}
