"use client";

import { useCartStore } from "@/store/cart";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function CartDrawer() {
  const { items, isOpen, toggleCart, updateQuantity, removeItem, total } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleCart}
      />

      {/* Drawer */}
      <aside 
        className={cn(
          "fixed top-0 right-0 z-[101] h-full w-full max-w-md bg-white dark:bg-neutral-900 shadow-2xl transition-transform duration-500 ease-out transform flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Mi Carrito</h2>
            <span className="bg-neutral-100 dark:bg-neutral-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {items.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <button 
            onClick={toggleCart}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-300 dark:text-neutral-600">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-bold">Tu carrito está vacío</p>
                <p className="text-sm text-neutral-500 max-w-[200px] mx-auto">¡Parece que aún no has añadido productos premium a tu colección!</p>
              </div>
              <button 
                onClick={toggleCart}
                className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-bold shadow-lg active:scale-95 transition-all"
              >
                Explorar productos
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 group">
                  <div className="relative w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden shrink-0 shadow-sm border dark:border-neutral-800">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 flex flex-col py-0.5">
                    <div className="flex justify-between gap-2 mb-1">
                      <h3 className="text-sm font-bold line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </h3>
                      <button 
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="p-1 text-neutral-300 hover:text-red-500 transition-colors shrink-0"
                        aria-label="Eliminar item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
                      SKU: {item.sku}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center bg-neutral-50 dark:bg-neutral-800/50 rounded-full px-2 py-1 gap-4 border dark:border-neutral-800">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.variantId, Math.max(1, item.quantity - 1))}
                          className="hover:text-blue-600 p-1 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="hover:text-blue-600 p-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-base tracking-tight">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-6 px-1">
              <span className="text-neutral-500 font-medium tracking-tight">Subtotal estimado</span>
              <span className="text-2xl font-black tracking-tighter">{formatPrice(total())}</span>
            </div>
            <Link 
              href="/checkout" 
              onClick={toggleCart}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] group"
            >
              Completar pedido
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center justify-center gap-2 mt-4 text-neutral-400">
              <div className="w-1 h-1 rounded-full bg-neutral-300" />
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold">
                Verificación manual de pago
              </p>
              <div className="w-1 h-1 rounded-full bg-neutral-300" />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
