"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setParticles(
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 80 + 20,
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

  return (
    <section
      className="relative h-[70vh] md:h-[85vh] min-h-[500px] md:min-h-[600px] max-h-[900px] overflow-hidden flex items-center"
      aria-label="Productos destacados"
    >
      {/* Capa 1: Gradient mesh animado (CSS puro) */}
      <div className="hero-gradient-bg absolute inset-0 z-0" />

      {/* Capa 2: Partículas flotantes (Framer Motion, solo cliente) */}
      {mounted && particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-lg bg-white/10 backdrop-blur-sm pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.05, 0.2, 0.05],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Overlay oscuro sobre gradiente para legibilidad del texto */}
      <div className="absolute inset-0 z-10 bg-black/30" />

      {/* Capa 3: Imagen del producto actual (transición fade) */}
      {current?.images?.[0] && (
        <motion.div
          key={currentIndex}
          className="absolute inset-0 md:inset-y-0 md:right-0 md:w-1/2 z-10"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <Image
            src={current.images[0].url}
            alt={current.images[0].alt ?? current.name}
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Degradado para fusionar imagen con el fondo - Más intenso en móvil para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 md:bg-gradient-to-r md:from-black/90 md:via-black/50 md:to-transparent" />
        </motion.div>
      )}

      {/* Capa 4: Contenido del hero */}
      <div className="relative z-20 container mx-auto px-6 md:px-12">
        <motion.div
          key={`content-${currentIndex}`}
          className="max-w-2xl mx-auto md:mx-0 text-center md:text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          {current?.promoPrice && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest mb-6 shadow-lg shadow-blue-500/20"
            >
              Oferta exclusiva
            </motion.span>
          )}

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            {current?.name ?? "Descubre nuestra colección premium"}
          </h1>

          <p className="text-white/70 text-base md:text-xl mb-8 md:mb-10 max-w-md mx-auto md:mx-0 leading-relaxed">
            Productos de calidad excepcional con envío garantizado a todo el país.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            {current ? (
              <Link
                href={`/producto/${current.slug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-neutral-100 transition-all active:scale-95 shadow-xl shadow-white/10"
              >
                Ver producto
                <span className="text-xl" aria-hidden>→</span>
              </Link>
            ) : (
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-100 transition-colors"
              >
                Ver colección
                <span aria-hidden>→</span>
              </Link>
            )}
            <Link
              href="/#catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Explorar
            </Link>
          </div>

          {current && (
            <div className="mt-6 flex items-baseline justify-center md:justify-start gap-3">
              {current.promoPrice ? (
                <>
                  <span className="text-3xl font-bold text-white">${current.promoPrice}</span>
                  <span className="text-white/50 line-through text-lg">${current.price}</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-white">${current.price}</span>
              )}
            </div>
          )}
        </motion.div>

        {products && products.length > 1 && (
          <div className="flex justify-center md:justify-start gap-2 mt-6 md:mt-8">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Ir al producto ${i + 1}`}
                className={`h-2 rounded-lg transition-all duration-300 ${
                  i === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
