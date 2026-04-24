import { requireCustomerSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, MessageCircle, FileText, CheckCircle2, Clock, AlertCircle, ShoppingBag } from "lucide-react";
import type { OrderStatus } from "@prisma/client";

function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case "COMPLETADA": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case "CANCELADA":
    case "RECHAZADA": return <AlertCircle className="w-5 h-5 text-red-500" />;
    default: return <Clock className="w-5 h-5 text-blue-500" />;
  }
}

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case "COMPLETADA": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "CANCELADA":
    case "RECHAZADA": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  }
}

export default async function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCustomerSession();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: {
              type: true,
              time: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { url: true, alt: true }
              }
            }
          }
        }
      },
      statusHistory: {
        orderBy: { changedAt: "desc" }
      }
    }
  });

  if (!order || order.customerId !== session.user.id) {
    notFound();
  }

  // Marcar como visto asincronamente
  prisma.customerAction.create({
    data: {
      customerId: session.user.id,
      action: "VIEWED_ORDER",
      description: `Pedido #${order.orderNumber} consultado`,
    }
  }).catch(console.error);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";
  const whatsappMsg = encodeURIComponent(`Hola, necesito ayuda con mi pedido #${order.orderNumber}`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/cuenta/pedidos" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Mis Pedidos
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
              Pedido <span className="text-blue-600 dark:text-blue-500">#{order.orderNumber}</span>
              <span className={`text-sm px-3 py-1 rounded-lg font-bold ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </h1>
            <p className="text-neutral-500 mt-2">
              Realizado el {new Date(order.createdAt).toLocaleDateString()} a las {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#25D366] text-white font-bold rounded-md hover:bg-[#128C7E] transition-colors shadow-sm"
          >
            <MessageCircle className="w-5 h-5" />
            Necesito Ayuda
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Items and Payment details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Order Items */}
          <div className="bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Artículos del Pedido</h2>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {order.items.map((item) => {
                const img = item.product.images[0];
                return (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-md flex-shrink-0 overflow-hidden relative">
                      {img ? (
                        <Image src={img.url} alt={img.alt || item.name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <ShoppingBag className="w-8 h-8 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-neutral-900 dark:text-white">{item.name}</h4>
                      {item.product.type === "SERVICE" && (
                        <span className="inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 my-1">
                          Servicio | Duración: {item.product.time}Hrs
                        </span>
                      )}
                      <p className="text-sm text-neutral-500">SKU: {item.sku}</p>
                      <div className="mt-1 font-medium text-neutral-900 dark:text-white">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <div className="text-lg font-bold text-neutral-900 dark:text-white">
                        ${(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-6 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 text-right">
              <div className="flex justify-between items-center max-w-[300px] ml-auto">
                <span className="text-neutral-500 font-medium">Subtotal</span>
                <span className="text-neutral-900 dark:text-white font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center max-w-[300px] ml-auto mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-900 dark:text-white font-bold text-lg">Total</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
              <FileText className="w-5 h-5 text-neutral-500" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Detalles del Pago</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Banco Origen</p>
                <p className="font-semibold text-neutral-900 dark:text-white">{order.bankName}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">Titular</p>
                <p className="font-semibold text-neutral-900 dark:text-white">{order.accountHolder}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">Referencia</p>
                <p className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded inline-block">
                  {order.referenceNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">Fecha de Transferencia</p>
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {new Date(order.transferDate).toLocaleDateString()}
                </p>
              </div>
              {order.voucherUrl && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-neutral-500 mb-2">Comprobante (Voucher)</p>
                  <a 
                    href={order.voucherUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
                  >
                    Ver comprobante adjunto
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Timeline */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 sticky top-28">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Historial de Estado</h2>
            
            <div className="relative border-l-2 border-neutral-100 dark:border-neutral-800 ml-3 space-y-8">
              {order.statusHistory.map((history, idx) => {
                const isLatest = idx === 0;
                return (
                  <div key={history.id} className="relative pl-6">
                    <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-lg border-4 border-white dark:border-neutral-900 flex items-center justify-center shadow-sm
                      ${isLatest ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'}`
                    }>
                      {getStatusIcon(history.status)}
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${isLatest ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
                        {history.status}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {new Date(history.changedAt).toLocaleString()}
                      </p>
                      {history.note && (
                        <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800/50">
                          {history.note}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
