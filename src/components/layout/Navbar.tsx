"use client";

import { Link } from "@/i18n/navigation";
import { ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const t = useTranslations("Header");
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header 
      className={cn(
        "sticky top-0 z-[80] w-full transition-all duration-300",
        isScrolled 
          ? "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50 py-3 shadow-sm" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-2xl font-black tracking-tighter hover:opacity-80 transition-opacity"
        >
          EC<span className="text-blue-600">PM</span>
        </Link>

        <div className="flex items-center gap-4 md:gap-8">
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#catalogo" className="text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-blue-600 transition-colors">
              {t("catalog")}
            </Link>
            <Link href="/nosotros" className="text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-blue-600 transition-colors">
              {t("about")}
            </Link>
          </nav>

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 hidden md:block" />

          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSelector />
            <ThemeToggle />
            
            <Link 
              href="/cuenta" 
              className="p-2 text-neutral-600 hover:text-blue-600 transition-all rounded-lg hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              title={t("account")}
            >
              <User className="w-5 h-5" />
            </Link>

            <button 
              onClick={toggleCart}
              className="p-2 relative group text-neutral-600 hover:text-blue-600 transition-all rounded-lg hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              aria-label={t("cart")}
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-lg flex items-center justify-center ring-2 ring-white dark:ring-neutral-900 animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
