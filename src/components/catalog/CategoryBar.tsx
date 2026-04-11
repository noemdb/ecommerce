import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryBarProps {
  categories: Category[];
  activeCategoryId?: string | null;
}

export function CategoryBar({ categories, activeCategoryId }: CategoryBarProps) {
  return (
    <div className="sticky top-16 z-40 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-y border-neutral-200 dark:border-neutral-800 shadow-sm overflow-x-auto no-scrollbar">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-3 min-w-max">
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
      </div>
    </div>
  );
}
