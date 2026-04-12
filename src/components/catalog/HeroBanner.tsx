"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
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
}

interface HeroBannerProps {
  products: HeroProduct[];
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function HeroBanner({ products }: HeroBannerProps) {
  const t = useTranslations("Hero");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    setParticles(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 60 + 15,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 4,
      }))
    );
  }, []);

  useEffect(() => {
    if (!products || products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  const current = products && products.length > 0 ? products[currentIndex] : null;
  const discount = current?.promoPrice
    ? Math.round(((current.price - current.promoPrice) / current.price) * 100)
    : 0;

  return (
    <section
      className="relative h-[70vh] md:h-[85vh] min-h-[500px] md:min-h-[600px] max-h-[900px] overflow-hidden flex items-center"
      aria-label="Productos destacados"
    >
      {/* Capa 1: Gradient adaptativo de fondo */}
      <div className="hero-gradient-adaptive absolute inset-0 z-0" />

      {/* Capa 2: Partículas flotantes */}
      {mounted && !shouldReduceMotion && particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-lg bg-black/5 dark:bg-white/10 backdrop-blur-sm pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], x: [0, 15, 0], opacity: [0.03, 0.15, 0.03] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Capa 3: Imagen del producto como fondo del lado derecho */}
      {current?.images?.[0] && (
        <motion.div
          key={currentIndex}
          className="absolute inset-0 md:inset-y-0 md:right-0 md:w-1/2 z-10"
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: shouldReduceMotion ? 0.3 : 1.2, ease: "easeOut" }}
        >
          <Image
            src={current.images[0].url}
            alt={current.images[0].alt ?? current.name}
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Degradado fusión: lateral izquierdo y oscurecimiento base */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/30 to-white/10 md:bg-gradient-to-r md:from-white/90 md:via-white/20 md:to-transparent dark:bg-gradient-to-t dark:from-black/95 dark:via-black/40 dark:to-black/10 dark:md:bg-gradient-to-r dark:md:from-black/90 dark:md:via-black/30 dark:md:to-transparent" />
          {/* Oscurecimiento inferior para el panel de info */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10" />
        </motion.div>
      )}

      {/* Capa 4: Overlay global suave */}
      <div className="absolute inset-0 z-10 bg-white/5 dark:bg-black/20" />

      {/* Capa 5: Contenido — dos columnas en md+ */}
      <div className="relative z-20 w-full h-full flex">

        {/* ── COLUMNA IZQUIERDA: Texto + CTAs ──────────────────── */}
        <div className="flex items-center w-full md:w-1/2">
          <div className="container md:max-w-none md:px-12 px-6 py-8 w-full">
            <motion.div
              key={`content-${currentIndex}`}
              className="max-w-xl mx-auto md:mx-0 text-center md:text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              {current?.promoPrice && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest mb-6 shadow-lg shadow-blue-500/20"
                >
                  <Zap className="w-3 h-3" />
                  {t("badge")}
                </motion.span>
              )}

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-white leading-[1.1] mb-5 tracking-tight">
                {current?.name ?? (
                  <>
                    {t("title_start")} <span className="text-blue-500">{t("title_highlight")}</span>
                  </>
                )}
              </h1>

              <p className="text-neutral-600 dark:text-white/70 text-base md:text-lg mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">
                {t("description")}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
                {current ? (
                  <Link
                    href={`/producto/${current.slug}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-all active:scale-95 shadow-xl"
                  >
                    {t("cta_catalog")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/#catalogo"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-colors"
                  >
                    {t("cta_catalog")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  href="/#catalogo"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-neutral-800/40 dark:border-white/30 text-neutral-800 dark:text-white font-semibold rounded-xl hover:bg-neutral-900/8 dark:hover:bg-white/10 transition-colors"
                >
                  {t("cta_about")}
                </Link>
              </div>

              {/* Precio en mobile */}
              {current && (
                <div className="mt-6 flex items-baseline justify-center md:justify-start gap-3">
                  {current.promoPrice ? (
                    <>
                      <span className="text-3xl font-bold text-neutral-900 dark:text-white">{formatPrice(current.promoPrice)}</span>
                      <span className="text-neutral-500 dark:text-white/50 line-through text-lg">{formatPrice(current.price)}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-neutral-900 dark:text-white">{formatPrice(current.price)}</span>
                  )}
                </div>
              )}

              {/* Dots */}
              {products && products.length > 1 && (
                <div className="flex justify-center md:justify-start gap-2 mt-6">
                  {products.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      aria-label={`Ir al producto ${i + 1}`}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        i === currentIndex
                          ? "w-8 bg-neutral-900 dark:bg-white"
                          : "w-2 bg-neutral-400/50 dark:bg-white/30 hover:bg-neutral-600 dark:hover:bg-white/60"
                      )}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── COLUMNA DERECHA: Panel de info sobre la imagen (md+) ── */}
        {current && (
          <div className="hidden md:flex w-1/2 items-end justify-start pb-10 pl-8 pr-6 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={`info-${currentIndex}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: shouldReduceMotion ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                className="relative z-20 w-full max-w-sm"
              >
                {/* Panel glassmorphism */}
                <div className="rounded-2xl border border-white/30 dark:border-white/10 bg-black/40 dark:bg-black/55 backdrop-blur-xl shadow-2xl overflow-hidden">

                  {/* Cabecera coloreada */}
                  <div className="px-5 pt-5 pb-4 border-b border-white/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1.5 block">
                          · Producto destacado
                        </span>
                        <h2 className="text-white font-bold text-lg leading-snug line-clamp-2">
                          {current.name}
                        </h2>
                      </div>
                      {discount > 0 && (
                        <div className="flex-shrink-0 flex items-center gap-1 bg-blue-600 text-white text-xs font-black px-2.5 py-1.5 rounded-xl">
                          <Tag className="w-3 h-3" />
                          -{discount}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Precio */}
                  <div className="px-5 py-4 border-b border-white/10">
                    {current.promoPrice ? (
                      <div className="flex items-end gap-3">
                        <span className="text-3xl font-black text-white leading-none">
                          {formatPrice(current.promoPrice)}
                        </span>
                        <div className="flex flex-col mb-0.5">
                          <span className="text-xs text-white/40 line-through leading-none">
                            {formatPrice(current.price)}
                          </span>
                          <span className="text-xs text-emerald-400 font-semibold leading-tight">
                            Ahorras {formatPrice(current.price - current.promoPrice)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-3xl font-black text-white leading-none">
                        {formatPrice(current.price)}
                      </span>
                    )}
                  </div>

                  {/* Trust bullets */}
                  <div className="px-5 py-3 border-b border-white/10 flex flex-col gap-1.5">
                    {[
                      "Envío inmediato al confirmar pago",
                      "Soporte por WhatsApp disponible",
                      "Garantía de calidad en cada producto",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="px-5 py-4">
                    <Link
                      href={`/producto/${current.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-100 transition-all active:scale-95 shadow-lg"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Ver producto completo
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
