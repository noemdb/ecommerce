"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";

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

  const activeCategory = activeCategoryId 
    ? categories.find(c => c.id === activeCategoryId) 
    : null;

  return (
    <div className="sticky top-16 z-40 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-y border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Desktop View (md and above) */}
        <div className="hidden md:flex items-center gap-2 py-3 min-w-max">
          <Link
            href="/#catalogo"
            prefetch={false}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
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
              prefetch={false}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                activeCategoryId === category.id
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-shape"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              )}
            >
              {category.name}
            </Link>
          ))}
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
