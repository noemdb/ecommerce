"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

interface CategoryBarProps {
  categories: Category[];
  activeCategoryId?: string | null;
}

export function CategoryBar({ categories, activeCategoryId }: CategoryBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("CategoryBar");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState<number>(categories.length + 1);

  const activeCategory = activeCategoryId 
    ? categories.find(c => c.id === activeCategoryId) 
    : null;

  const allItems = [
    { id: 'todos', name: 'Todos' },
    ...categories.map(c => ({ id: c.id, name: c.name }))
  ];

  useEffect(() => {
    const updateVisibleCount = () => {
      if (!containerRef.current) return;
      
      const windowWidth = window.innerWidth;
      
      if (windowWidth < 768) {
        // Return early for mobile view (< md), we don't manage it here
        return;
      }

      if (windowWidth >= 768 && windowWidth < 1024) {
        // Pantallas medianas: muestra solo 3, las demas colapsadas
        setVisibleCount(Math.min(3, allItems.length));
        return;
      }

      // Pantallas ms grandes (>= lg): dinámico basado en anchura de la página
      const containerWidth = containerRef.current.clientWidth;
      
      // Calculate total required width to check if all items can fit natively
      const totalWidthForItems = allItems.reduce(
        (acc, item) => acc + (40 + item.name.length * 9.5), 
        0
      );

      if (totalWidthForItems <= containerWidth) {
        setVisibleCount(allItems.length);
        return;
      }

      let reserve = 130; // Safely reserve space for "Más" dropdown
      let availableWidth = containerWidth - reserve;
      let currentWidth = 0;
      let count = 0;
      
      for (const item of allItems) {
        const itemWidth = 40 + (item.name.length * 9.5); // Estimate avg px per char + padding/margin
        currentWidth += itemWidth;
        
        if (currentWidth <= availableWidth) {
          count++;
        } else {
          break;
        }
      }
      
      setVisibleCount(count === 0 ? 1 : count);
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, [categories, allItems.length]); // Added allItems.length to avoid unnecessary recalculations

  const visibleItems = allItems.slice(0, visibleCount);
  const hiddenItems = allItems.slice(visibleCount);

  return (
    <div className="sticky top-16 z-40 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-y border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="container mx-auto px-4" ref={containerRef}>
        {/* Desktop View (md and above) */}
        <div className="hidden md:flex items-center gap-2 py-3 overflow-hidden">
          {visibleItems.map((item) => {
            const isActive = item.id === 'todos' ? !activeCategoryId : activeCategoryId === item.id;
            const href = item.id === 'todos' ? '/#catalogo' : `/?categoryId=${item.id}#catalogo`;
            
            return (
              <Link
                key={item.id}
                href={href}
                prefetch={false}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-shape"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                )}
              >
                {item.name}
              </Link>
            );
          })}

          {hiddenItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "px-4 py-2 flex items-center gap-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0",
                  "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 outline-none"
                )}
              >
                Más
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 overflow-y-auto max-h-[60vh]">
                {hiddenItems.map((item) => {
                  const isActive = item.id === 'todos' ? !activeCategoryId : activeCategoryId === item.id;
                  const href = item.id === 'todos' ? '/#catalogo' : `/?categoryId=${item.id}#catalogo`;
                  
                  return (
                    <DropdownMenuItem asChild key={item.id} className="cursor-pointer">
                      <Link
                        href={href}
                        className={cn(
                          "w-full block py-2",
                          isActive && "font-bold text-blue-600 dark:text-blue-400"
                        )}
                      >
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile View (Below md) */}
        <div className="md:hidden flex flex-col">
          <div className="flex items-center justify-between py-3">
            <span className="font-semibold text-sm text-neutral-900 dark:text-white flex items-center">
              {t("explore")}
              {activeCategory && (
                <>
                  <span className="mx-1.5 text-neutral-400 font-normal text-xs md:text-sm">/</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium truncate max-w-[120px]">{activeCategory.name}</span>
                </>
              )}
            </span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 -mr-1 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle categories"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
          {isOpen && (
            <div className="flex flex-col gap-2 pb-4">
              <Link
                href="/#catalogo"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  !activeCategoryId
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-shape"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                )}
              >
                Todos
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/?categoryId=${category.id}#catalogo`}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    activeCategoryId === category.id
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-shape"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                  )}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
