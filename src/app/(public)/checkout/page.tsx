import { auth } from "@/auth";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = {
  title: "Finalizar Compra | Ecommerce Premium",
  description: "Cierra tu pedido de forma segura con nuestra verificación manual premium.",
};

export default async function CheckoutPage() {
  const session = await auth();
  const user = session?.user;

  // Pre-fill data if user is logged in
  const initialData = user ? {
    name: user.name || "",
    email: user.email || "",
    // phone is not in standard session user but could be fetched or added to session
  } : undefined;

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 lg:px-8 max-w-7xl">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link 
            href="/#catalogo" 
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver al catálogo
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-neutral-900 dark:text-white leading-tight">
            FINALIZAR <span className="text-blue-600">PEDIDO</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-full">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
            Checkout Seguro 256-bit SSL
          </span>
        </div>
      </div>

      <Suspense fallback={<div className="h-96 flex items-center justify-center font-bold italic opacity-30 animate-pulse uppercase tracking-[0.3em]">Preparando tu experiencia premium...</div>}>
        <CheckoutForm initialData={initialData} />
      </Suspense>

      <footer className="mt-20 pt-12 border-t dark:border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div className="space-y-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Verificación Manual</h4>
          <p className="text-sm text-neutral-500 font-medium">Cada reporte de pago es validado por nuestro equipo en menos de 1 hora (horario comercial).</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Envío Inmediato</h4>
          <p className="text-sm text-neutral-500 font-medium">Tras confirmar tu pago, el producto es despachado con embalaje premium reforzado.</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Atención Élite</h4>
          <p className="text-sm text-neutral-500 font-medium">Soporte prioritario vía WhatsApp directamente con nuestros curadores de producto.</p>
        </div>
      </footer>
    </div>
  );
}
