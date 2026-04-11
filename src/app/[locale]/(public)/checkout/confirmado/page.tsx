import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, Calendar, Tag, ArrowRight, Home } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import { auth } from "@/auth";

interface ConfirmationPageProps {
  searchParams: Promise<{ orderId: string }>;
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { orderId } = await searchParams;
  const session = await auth();
  
  if (!orderId) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    // @ts-ignore - Prisma client lag
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      total: true,
      bankName: true,
      items: {
        include: {
          product: {
            select: { name: true, images: { where: { isPrimary: true }, take: 1 } }
          }
        }
      }
    }
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="flex-1 container mx-auto px-4 py-12 md:py-24 flex flex-col items-center justify-center max-w-4xl">
      <div className="bg-white dark:bg-neutral-900 rounded-[3rem] shadow-2xl shadow-blue-500/5 border border-neutral-100 dark:border-neutral-800 overflow-hidden w-full overflow-hidden relative">
        {/* Success Header */}
        <div className="bg-emerald-600 p-12 text-center text-white space-y-4 relative">
          <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
            <CheckCircle2 className="w-32 h-32" />
          </div>
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center mx-auto mb-6 scale-110 shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">¡PEDIDO RECIBIDO!</h1>
          <p className="text-emerald-50 text-sm font-bold uppercase tracking-[0.2em] opacity-80">
            {/* @ts-ignore */}
            Número de Pedido: {order.orderNumber}
          </p>
        </div>

        <div className="p-8 md:p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Order Brief */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Resumen de la Orden</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-md flex items-center justify-center text-neutral-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-neutral-400">Fecha</p>
                    {/* @ts-ignore */}
                    <p className="text-sm font-bold">{order.createdAt.toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-md flex items-center justify-center text-neutral-500">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-neutral-400">Estado</p>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 rounded-lg">
                         VERIFICANDO PAGO
                       </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-md flex items-center justify-center text-neutral-500">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-neutral-400">Monto verificado</p>
                    {/* @ts-ignore */}
                    <p className="text-xl font-black tracking-tighter text-blue-600">{formatPrice(order.total)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-8 bg-neutral-50 dark:bg-neutral-950/40 rounded-lg border border-neutral-100 dark:border-neutral-800 space-y-4">
              <h4 className="text-sm font-black tracking-tight mb-2 italic">¿Qué sigue ahora?</h4>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                  {/* @ts-ignore */}
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug">Nuestro equipo verificará manualmente tu comprobante de pago en el banco <strong>{order.bankName}</strong>.</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug">Recibirás un email de confirmación una vez que el pedido sea aprobado para despacho.</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-400 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug">Te contactaremos vía WhatsApp o email con tu guía de rastreo premium.</p>
                </li>
              </ol>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-8 border-t dark:border-neutral-800">
            {session?.user?.role === "CUSTOMER" ? (
              <Link 
                href="/cuenta/pedidos" 
                className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 rounded-md font-bold transition-all shadow-lg active:scale-95 transition-all"
              >
                Ver en mis pedidos
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
                <Link 
                  href="/" 
                  className="flex-1 h-14 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center gap-2 rounded-md font-bold transition-all shadow-lg active:scale-95 transition-all"
                >
                  <Home className="w-5 h-5" />
                  Volver al Catálogo
                </Link>
            )}
            <div className="flex-1 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-md p-4 flex items-center justify-center text-center">
              <p className="text-[10px] font-bold text-neutral-400 italic">
                Cualquier duda, contáctanos mencionando tu número de pedido.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-950/40 px-8 py-4 text-center border-t border-neutral-100 dark:border-neutral-800">
           <p className="text-[9px] uppercase tracking-[0.3em] font-black text-neutral-300">Autenticidad Garantizada & Verificación de Seguridad</p>
        </div>
      </div>
    </div>
  );
}
