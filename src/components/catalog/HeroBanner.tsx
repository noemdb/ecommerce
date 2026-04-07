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
      className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden flex items-center"
      aria-label="Productos destacados"
    >
      {/* Capa 1: Gradient mesh animado (CSS puro) */}
      <div className="hero-gradient-bg absolute inset-0 z-0" />

      {/* Capa 2: Partículas flotantes (Framer Motion, solo cliente) */}
      {mounted && particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/10 backdrop-blur-sm pointer-events-none"
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
      <div className="absolute inset-0 z-10 bg-black/40" />

      {/* Capa 3: Imagen del producto actual (transición fade) */}
      {current?.images?.[0] && (
        <motion.div
          key={currentIndex}
          className="absolute right-0 top-0 h-full w-1/2 z-10"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Image
            src={current.images[0].url}
            alt={current.images[0].alt ?? current.name}
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
          />
          {/* Degradado para fusionar imagen con el fondo */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </motion.div>
      )}

      {/* Capa 4: Contenido del hero */}
      <div className="relative z-20 container mx-auto px-4 lg:px-8 max-w-2xl">
        <motion.div
          key={`content-${currentIndex}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          {current?.promoPrice && (
            <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold uppercase tracking-widest mb-4">
              Oferta especial
            </span>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            {current?.name ?? "Descubre nuestra colección premium"}
          </h1>

          <p className="text-white/80 text-lg mb-8 max-w-md">
            Productos de calidad excepcional con envío garantizado a todo el país.
          </p>

          <div className="flex flex-wrap gap-3">
            {current ? (
              <Link
                href={`/producto/${current.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-neutral-100 transition-colors"
              >
                Ver producto
                <span aria-hidden>→</span>
              </Link>
            ) : (
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-neutral-100 transition-colors"
              >
                Ver colección
                <span aria-hidden>→</span>
              </Link>
            )}
            <Link
              href="/#catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Explorar
            </Link>
          </div>

          {current && (
            <div className="mt-6 flex items-baseline gap-3">
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
          <div className="flex gap-2 mt-8">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Ir al producto ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
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
