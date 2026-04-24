"use client";

import { 
  motion, 
  useReducedMotion, 
  AnimatePresence, 
  useMotionValue, 
  useSpring, 
  useTransform 
} from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ShoppingCart, ArrowRight, Zap, Tag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface HeroProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  promoPrice: number | null;
  images: { url: string; alt: string | null }[];
  videoUrl?: string; // 👈 preparado
  type?: string;
  time?: number | null;
  description?: string;
  metaDescription?: string | null;
}

import type { SiteConfigData } from "@/lib/site-config/default-site-config";

interface HeroBannerProps {
  products: HeroProduct[];
  config: SiteConfigData;
}

const ACCENTS = [
  "rgba(59,130,246,0.25)",
  "rgba(139,92,246,0.25)",
  "rgba(6,182,212,0.25)",
  "rgba(245,158,11,0.25)",
  "rgba(16,185,129,0.25)",
  "rgba(236,72,153,0.25)",
];

function getAccent(id: string) {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return ACCENTS[sum % ACCENTS.length];
}

export function HeroBanner({ products, config }: HeroBannerProps) {
  const t = useTranslations("Hero");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // 👇 PREMIUM PARALLAX SYSTEM
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Mapeamos el movimiento para que sea sutil
  const translateX = useTransform(springX, [-0.5, 0.5], [-30, 30]);
  const translateY = useTransform(springY, [-0.5, 0.5], [-30, 30]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 👇 autoplay
  useEffect(() => {
    if (!products?.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % products.length);
    }, config.heroRotationIntervalMs || 5000);
    return () => clearInterval(interval);
  }, [products, config.heroRotationIntervalMs]);

  const current = products?.[currentIndex];
  const next = products?.[(currentIndex + 1) % products.length];

  const accent = current ? getAccent(current.id) : "rgba(59,130,246,0.2)";

  const discount = current?.promoPrice
    ? Math.round(((current.price - current.promoPrice) / current.price) * 100)
    : 0;

  // 👇 PREFETCH siguiente imagen
  useEffect(() => {
    if (!next?.images?.[0]) return;
    const img = new window.Image();
    img.src = next.images[0].url;
  }, [next]);

  return (
    <section
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
      className="relative min-h-[600px] lg:min-h-[80vh] flex items-center overflow-hidden bg-white dark:bg-neutral-950"
    >
      {/* Fondo Global */}
      <div
        className="absolute inset-0 z-0 opacity-30 transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at 70% 50%, ${accent}, transparent 70%)`,
        }}
      />

      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start relative z-10 py-20 lg:py-12">
        
        {/* COLUMNA IZQUIERDA: CONTENIDO */}
        <div className="order-2 md:order-1 max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {current?.promoPrice && config.heroShowUrgencyBar !== false && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                    <Zap className="w-3 h-3" />
                    {t("badge")}
                  </span>
                )}
                {(current as any)?.type === "SERVICE" && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest">
                    <Tag className="w-3 h-3" />
                    Servicio | Duración: {(current as any)?.time}Hrs
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-neutral-900 dark:text-white mb-6 leading-[1.05] tracking-tighter">
                {/* {t("title_start")}  */}
                <span className="text-blue-600 block mt-2">{current?.name}</span>
              </h1>

              <p className="text-base md:text-lg text-neutral-500 dark:text-neutral-400 mb-10 whitespace-pre-wrap leading-relaxed max-w-md italic">
                {current?.metaDescription || t("description")}
              </p>

              {current && (
                <div className="mb-10 flex items-baseline gap-4">
                  {current.promoPrice ? (
                    <>
                      <span className="text-4xl md:text-5xl font-black text-blue-600 tracking-tighter">
                        {formatPrice(current.promoPrice)}
                      </span>
                      <span className="text-xl text-neutral-300 dark:text-neutral-600 line-through italic">
                        {formatPrice(current.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter">
                      {formatPrice(current.price)}
                    </span>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* COLUMNA DERECHA: MEDIA */}
        <div className="order-1 md:order-2 flex items-start justify-center relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="relative aspect-square flex items-center justify-center max-h-[500px] w-full"
              style={{
                x: shouldReduceMotion ? 0 : translateX,
                y: shouldReduceMotion ? 0 : translateY,
                rotateX: shouldReduceMotion ? 0 : rotateX,
                rotateY: shouldReduceMotion ? 0 : rotateY,
                transformPerspective: 1000,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Spotlight localized */}
              <div 
                className="absolute inset-0 z-0 opacity-40 blur-3xl pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${accent}, transparent 70%)`
                }}
              />

              {current?.videoUrl ? (
                <video
                  src={current.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="relative z-10 max-h-full object-contain rounded-[10px]"
                />
              ) : current?.images?.[0]?.url ? (
                <Link 
                  href={`/producto/${current?.slug}`}
                  className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden hover:scale-[1.02] transition-transform duration-500"
                >
                  <Image
                    src={current.images[0].url}
                    alt={current.name}
                    width={1000}
                    height={1000}
                    priority
                    className="w-auto h-auto max-w-full max-h-full object-contain rounded-[10px] drop-shadow-[0_25px_50px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_25px_50px_rgba(255,255,255,0.05)]"
                  />
                </Link>
              ) : (
                <div className="relative z-10 w-full h-full flex items-center justify-center p-12 overflow-hidden bg-neutral-50 dark:bg-neutral-900/40 rounded-3xl">
                  <div className="absolute inset-0 opacity-20 animate-pulse"
                    style={{ background: `radial-gradient(circle at 20% 20%, ${accent}, transparent 60%)` }}
                  />
                  <span className="relative z-10 text-neutral-300 dark:text-neutral-600 font-black text-2xl md:text-4xl uppercase tracking-[0.4em] opacity-40 rotate-[-5deg] select-none text-center">
                    {current?.name}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* SEGUNDA ROW: BOTONES Y DOTS */}
        <div className="order-3 md:col-span-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mt-8 lg:mt-12 w-full">
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/producto/${current?.slug}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/25"
            >
              <ShoppingCart className="w-4 h-4" />
              {config.heroCtaPrimaryLabel || "Ver producto ahora"}
            </Link>

            <Link
              href="/#catalogo"
              className="inline-flex items-center gap-2 px-8 py-4 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              {config.heroCtaSecondaryLabel || t("cta_catalog")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Dots indicators */}
          {products.length > 1 && (
            <div className="flex gap-2.5">
              {products.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === currentIndex ? "w-10 bg-blue-600" : "w-2.5 bg-neutral-200 dark:bg-neutral-800"
                  )}
                  aria-label={`Ir al producto ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}