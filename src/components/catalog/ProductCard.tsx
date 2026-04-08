import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { RatingStars } from "./RatingStars";
import { AddToCartButton } from "./AddToCartButton";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    promoPrice: number | null;
    images: { url: string; alt: string | null }[];
    isNew?: boolean;
    stock: number;
    sku: string;
    reviews?: { rating: number }[];
  };
  badge?: string;
}

export function ProductCard({ product, badge }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  
  const averageRating = product.reviews?.length 
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length 
    : 0;

  return (
    <div className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col w-full max-w-[500px] mx-auto">
      <Link href={`/producto/${product.slug}`} className="absolute inset-0 z-0">
        <span className="sr-only">Ver {product.name}</span>
      </Link>
      
      {/* Badges */}
      <div className="absolute z-10 top-3 left-3 flex flex-col gap-2 pointer-events-none">
        {isOutOfStock ? (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
            Agotado
          </span>
        ) : (
          <>
            {badge && (
              <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                {badge}
              </span>
            )}
            {product.promoPrice && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                Oferta
              </span>
            )}
            {product.isNew && !badge && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                Nuevo
              </span>
            )}
          </>
        )}
      </div>

      {/* Image */}
      <div className="relative aspect-[4/5] bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        {product.images?.[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt ?? product.name}
            fill
            className={`object-cover object-center transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            Sin imagen
          </div>
        )}
        {/* Subtle gradient overlay at bottom for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 relative z-10 pointer-events-none">
        <h3 className="font-medium text-base leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors pointer-events-auto">
          <Link href={`/producto/${product.slug}`}>{product.name}</Link>
        </h3>
        
        {averageRating > 0 && (
          <RatingStars rating={averageRating} count={product.reviews?.length} className="mb-3" />
        )}
        
        <div className="mt-auto flex items-center justify-between gap-2 pointer-events-auto">
          <div className="flex flex-col">
            {product.promoPrice ? (
              <>
                <span className="text-sm text-neutral-400 line-through leading-none mb-1">{formatPrice(product.price)}</span>
                <span className="text-lg font-bold tracking-tight text-blue-600 dark:text-blue-400 leading-none">{formatPrice(product.promoPrice)}</span>
              </>
            ) : (
              <span className="text-lg font-bold tracking-tight leading-none">{formatPrice(product.price)}</span>
            )}
          </div>
          
          <AddToCartButton 
            product={product as any} 
            size="sm" 
            showIcon={false} 
            className="px-4"
          />
        </div>
      </div>
    </div>
  );
}
