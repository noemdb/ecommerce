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
  videoUrl?: string; // 👈 preparado
}

interface HeroBannerProps {
  products: HeroProduct[];
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

export function HeroBanner({ products }: HeroBannerProps) {
  const t = useTranslations("Hero");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // 👇 PARALLAX
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // 👇 autoplay
  useEffect(() => {
    if (!products?.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

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
        setMouse({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }}
      className="relative h-[80vh] min-h-[600px] max-h-[900px] overflow-hidden flex items-center justify-center"
    >
      {/* Fondo dinámico */}
      <div
        className="absolute inset-0 z-0 transition-colors duration-700"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, ${accent}, transparent 70%)
          `,
        }}
      />

      {/* MEDIA (video o imagen) */}
      {current && (
        <motion.div
          key={currentIndex}
          className="absolute inset-0 z-10"
          style={{
            transform: shouldReduceMotion
              ? "none"
              : `translate(${mouse.x * 20}px, ${mouse.y * 20}px) scale(1.05)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {current.videoUrl ? (
            <video
              src={current.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={current.images[0].url}
              alt={current.name}
              fill
              className="object-cover"
              priority
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        </motion.div>
      )}

      {/* CONTENIDO */}
      <div className="relative z-20 text-center px-6 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
          >
            {current?.promoPrice && (
              <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold mb-5">
                <Zap className="w-3 h-3" />
                {t("badge")}
              </span>
            )}

            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
              {current?.name}
            </h1>

            <p className="text-white/70 mb-8">
              {t("description")}
            </p>

            {current && (
              <div className="mb-6">
                {current.promoPrice ? (
                  <div className="flex justify-center gap-3">
                    <span className="text-4xl font-black text-white">
                      {formatPrice(current.promoPrice)}
                    </span>
                    <span className="text-white/50 line-through">
                      {formatPrice(current.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl font-black text-white">
                    {formatPrice(current.price)}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/producto/${current?.slug}`}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-all active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                Ver producto
              </Link>

              <Link
                href="/#catalogo"
                className="inline-flex items-center gap-2 px-8 py-3 border border-white/30 text-white rounded-xl hover:bg-white/10"
              >
                {t("cta_catalog")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* dots */}
            {products.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {products.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40"
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* PANEL */}
      {current && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md">
          <div className="rounded-2xl border border-white/20 bg-black/50 backdrop-blur-xl p-5 text-white shadow-2xl">
            <div className="flex justify-between mb-3">
              <h2 className="font-bold">{current.name}</h2>
              {discount > 0 && <span>-{discount}%</span>}
            </div>

            <Link
              href={`/producto/${current.slug}`}
              className="w-full inline-flex justify-center px-5 py-3 bg-white text-black font-bold rounded-xl"
            >
              Ver producto completo
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}