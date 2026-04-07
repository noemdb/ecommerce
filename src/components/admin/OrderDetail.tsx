"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateOrderStatusAction } from "@/actions/admin-order";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import {
  ArrowLeft,
  Clock,
  Hourglass,
  BadgeCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Package,
  User,
  CreditCard,
  FileText,
  AlertCircle,
} from "lucide-react";

type OrderDetailType = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  bankName: string;
  accountHolder: string;
  referenceNumber: string;
  transferAmount: number;
  transferDate: Date;
  voucherUrl: string | null;
  subtotal: number;
  total: number;
  internalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    product: { id: string; name: string; slug: string };
    variant: { id: string; name: string; value: string } | null;
  }>;
  customer: { id: string; name: string; email: string } | null;
  confirmedBy: { id: string; name: string } | null;
  statusHistory: Array<{
    id: string;
    status: OrderStatus;
    note: string | null;
    changedAt: Date;
  }>;
};

const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDIENTE: { label: "Pendiente", color: "text-amber-600 bg-amber-500/10 border-amber-200", icon: Clock },
  VERIFICANDO: { label: "Verificando", color: "text-blue-600 bg-blue-500/10 border-blue-200", icon: Hourglass },
  CONFIRMADA: { label: "Confirmada", color: "text-emerald-600 bg-emerald-500/10 border-emerald-200", icon: BadgeCheck },
  EN_PROCESO: { label: "En proceso", color: "text-purple-600 bg-purple-500/10 border-purple-200", icon: RefreshCw },
  COMPLETADA: { label: "Completada", color: "text-green-600 bg-green-500/10 border-green-200", icon: CheckCircle2 },
  CANCELADA: { label: "Cancelada", color: "text-red-600 bg-red-500/10 border-red-200", icon: XCircle },
  RECHAZADA: { label: "Rechazada", color: "text-red-600 bg-red-500/10 border-red-200", icon: XCircle },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDIENTE: ["VERIFICANDO", "CANCELADA", "RECHAZADA"],
  VERIFICANDO: ["CONFIRMADA", "CANCELADA", "RECHAZADA"],
  CONFIRMADA: ["EN_PROCESO", "CANCELADA", "RECHAZADA"],
  EN_PROCESO: ["COMPLETADA", "CANCELADA", "RECHAZADA"],
};

export function OrderDetail({ order }: { order: OrderDetailType }) {
  const [isPending, startTransition] = useTransition();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const confirm = useConfirm();

  const s = STATUS_META[order.status];
  const Icon = s.icon;
  const nextStatuses = NEXT_STATUS[order.status] ?? [];

  async function changeStatus(newStatus: OrderStatus) {
    setShowStatusMenu(false);

    if (["CONFIRMADA", "CANCELADA", "RECHAZADA", "COMPLETADA"].includes(newStatus)) {
      const isConfirmed = await confirm({
        title: `¿Cambiar estado a ${STATUS_META[newStatus].label}?`,
        description: `Estás a punto de marcar la orden ${order.orderNumber} como ${STATUS_META[newStatus].label}. Esta acción enviará una notificación al cliente y afectará el flujo de despacho.`,
        confirmText: "Confirmar cambio",
        cancelText: "Volver",
        variant: newStatus === "CANCELADA" || newStatus === "RECHAZADA" ? "danger" : "primary"
      });
      if (!isConfirmed) return;
    }

    startTransition(async () => {
      const res = await updateOrderStatusAction(order.id, newStatus);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl">

      {/* Back + Header */}
      <div>
        <Link
          href="/admin/ordenes"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Órdenes
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Creada el{" "}
              {new Date(order.createdAt).toLocaleDateString("es-VE", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Status control */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border",
                s.color
              )}
            >
              <Icon className="w-4 h-4" />
              {s.label}
            </span>

            {nextStatuses.length > 0 && (
              <div className="relative">
                <Button
                  size="sm"
                  onClick={() => setShowStatusMenu((v) => !v)}
                  isLoading={isPending}
                  className="gap-2"
                >
                  Cambiar estado
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>

                {showStatusMenu && (
                  <div className="absolute right-0 top-full mt-2 z-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden min-w-[180px] animate-in zoom-in-95 fade-in duration-150">
                    {nextStatuses.map((ns) => {
                      const meta = STATUS_META[ns];
                      const NSIcon = meta.icon;
                      return (
                        <button
                          key={ns}
                          onClick={() => changeStatus(ns)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                        >
                          <NSIcon className="w-4 h-4 text-neutral-400" />
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="font-bold text-sm">Cliente</h3>
          </div>
          <div className="space-y-1">
            <p className="font-semibold">{order.customerName}</p>
            <p className="text-sm text-neutral-500">{order.customerEmail}</p>
            <p className="text-sm text-neutral-500">{order.customerPhone}</p>
            {order.customer && (
              <Link
                href={`/admin/clientes/${order.customer.id}`}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Ver perfil →
              </Link>
            )}
            {!order.customer && (
              <p className="text-xs text-neutral-400 italic">Cliente invitado</p>
            )}
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="font-bold text-sm">Pago</h3>
          </div>
          <div className="space-y-1">
            <p className="font-semibold">{order.bankName}</p>
            <p className="text-sm text-neutral-500">
              Titular: {order.accountHolder}
            </p>
            <p className="text-sm">
              Ref:{" "}
              <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-lg">
                {order.referenceNumber}
              </code>
            </p>
            <p className="text-sm text-neutral-500">
              Monto: ${order.transferAmount.toFixed(2)}
            </p>
            {order.voucherUrl && (
              <a
                href={order.voucherUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Ver comprobante →
              </a>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-bold text-sm">Resumen</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            {order.confirmedBy && (
              <p className="text-xs text-neutral-400 pt-1">
                Confirmada por {order.confirmedBy.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
          <Package className="w-4 h-4 text-neutral-400" />
          <h3 className="font-bold">Artículos ({order.items.length})</h3>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {order.items.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                {item.variant && (
                  <p className="text-xs text-neutral-400">
                    {item.variant.name}: {item.variant.value}
                  </p>
                )}
                <code className="text-xs text-neutral-400">{item.sku}</code>
              </div>
              <div className="text-sm text-neutral-500">
                {item.quantity} × ${item.price.toFixed(2)}
              </div>
              <div className="font-bold w-24 text-right">
                ${(item.quantity * item.price).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status timeline */}
      {order.statusHistory.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="font-bold">Historial de estados</h3>
          <div className="relative flex flex-col gap-4 pl-6">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-neutral-200 dark:bg-neutral-800" />
            {order.statusHistory.map((h) => {
              const meta = STATUS_META[h.status];
              const HIcon = meta.icon;
              return (
                <div key={h.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-3.5 h-3.5 rounded-full border-2 border-white dark:border-neutral-900 shrink-0 -ml-6 mt-0.5 ring-2",
                      h.status === "CANCELADA"
                        ? "bg-red-500 ring-red-200"
                        : h.status === "COMPLETADA"
                        ? "bg-green-500 ring-green-200"
                        : "bg-blue-500 ring-blue-200"
                    )}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <HIcon className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-sm font-semibold">{meta.label}</span>
                    </div>
                    {h.note && (
                      <p className="text-xs text-neutral-400 mt-0.5">{h.note}</p>
                    )}
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {new Date(h.changedAt).toLocaleString("es-VE")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Internal notes */}
      {order.internalNotes && (
        <div className="flex gap-3 p-5 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-400 mb-1">
              Notas internas
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              {order.internalNotes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
