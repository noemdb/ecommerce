"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PremiumToastProps {
  t: string | number;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  image?: string;
  type?: "success" | "error" | "info" | "cart";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const PremiumToast = ({
  t,
  title,
  description,
  icon,
  image,
  type = "info",
  action,
}: PremiumToastProps) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    cart: <ShoppingCart className="w-5 h-5 text-amber-500" />,
  };

  const defaultIcon = icon || icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative flex w-fit min-w-[320px] max-w-[480px] pointer-events-auto rounded-lg overflow-hidden",
        "bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl",
        "border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
      )}
    >
      <div className="flex-1 p-4">
        <div className="flex items-start">
          {image ? (
            <div className="flex-shrink-0 pt-0.5">
              <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0 pt-0.5">
              {defaultIcon}
            </div>
          )}
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </p>
            {description && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col border-l border-white/20 dark:border-white/10">
        {action ? (
          <button
            onClick={() => {
              action.onClick();
              toast.dismiss(t);
            }}
            className="w-full flex-1 flex items-center justify-center text-xs font-bold text-neutral-900 dark:text-white px-4 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors uppercase tracking-wider"
          >
            {action.label}
          </button>
        ) : null}
        <button
          onClick={() => toast.dismiss(t)}
          className="w-full h-1/2 flex items-center justify-center text-neutral-400 hover:text-neutral-500 p-4"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export const showPremiumToast = {
  success: (title: string, description?: string) => 
    toast.custom((t) => (
      <PremiumToast t={t} title={title} description={description} type="success" />
    )),
  error: (title: string, description?: string) => 
    toast.custom((t) => (
      <PremiumToast t={t} title={title} description={description} type="error" />
    )),
  cart: (product: { name: string; image?: string }, onAction?: () => void) => 
    toast.custom((t) => (
      <PremiumToast 
        t={t} 
        title="¡Añadido al carrito!" 
        description={product.name} 
        image={product.image}
        type="cart"
        action={onAction ? { label: "Ver", onClick: onAction } : undefined}
      />
    )),
};
