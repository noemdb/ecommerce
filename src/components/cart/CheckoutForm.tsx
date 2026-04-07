"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/lib/validators/checkout";
import { createOrderAction } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowRight, CreditCard, Building2, Upload, AlertCircle, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

interface CheckoutFormProps {
  initialData?: Partial<CheckoutInput>;
}

export function CheckoutForm({ initialData }: CheckoutFormProps) {
  const { items, total, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: initialData,
  });

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      toast.error("Tu carrito está vacío");
      router.push("/");
    }
  }, [items, router, isLoading]);

  const onSubmit = async (data: CheckoutInput) => {
    setIsLoading(true);
    try {
      // Map items to action format
      const orderItems = items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        quantity: it.quantity,
        price: it.price,
        name: it.name,
        sku: it.sku,
      }));

      const result = await createOrderAction(data, orderItems);
      
      if (result.success) {
        toast.success("¡Pedido realizado con éxito!");
        clearCart();
        router.push(`/checkout/confirmado?orderId=${result.data.orderId}`);
      } else {
        toast.error(result.error || "Error al procesar el pedido");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left Wall: Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">1. Información del Cliente</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre Completo"
              placeholder="Ej. Juan Pérez"
              {...register("name")}
              error={errors.name?.message}
            />
            <Input
              label="Email de Notificación"
              placeholder="juan@ejemplo.com"
              {...register("email")}
              error={errors.email?.message}
            />
          </div>
          <Input
            label="Teléfono de Contacto"
            placeholder="+52 ..."
            {...register("phone")}
            error={errors.phone?.message}
          />
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">2. Detalles de Pago</h2>
          </div>
          <div className="space-y-4">
            <div className="w-full space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">
                Banco Emisor
              </label>
              <select 
                {...register("bankName")}
                className="flex h-14 w-full rounded-2xl border-2 border-neutral-100 bg-white px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:border-blue-600 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white"
              >
                <option value="">Selecciona un banco</option>
                <option value="BBVA">BBVA</option>
                <option value="Banorte">Banorte</option>
                <option value="Santander">Santander</option>
                <option value="PayPal">PayPal / Transferencia</option>
                <option value="Otros">Otros</option>
              </select>
              {errors.bankName && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.bankName.message}</p>
              )}
            </div>
            <Input
              label="Referencia de Pago (Últimos 4-6 dígitos)"
              placeholder="0000"
              {...register("paymentReference")}
              error={errors.paymentReference?.message}
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">3. Comprobante de Pago</h2>
          </div>
          <div className="p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl text-center space-y-4 hover:border-blue-500/50 hover:bg-blue-50/10 transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full mx-auto flex items-center justify-center text-neutral-400 group-hover:scale-110 group-hover:text-blue-600 transition-all">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">Haz clic para subir comprobante</p>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest">PNG, JPG hasta 5MB</p>
            </div>
            {/* Mock input - in real app would use uploadthing or similar */}
            <input type="file" className="hidden" />
          </div>
          <div className="flex gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider leading-relaxed">
              Importante: Nuestro equipo verificará manualmente tu pago. El pedido se procesará una vez confirmado el depósito.
            </p>
          </div>
        </section>

        <Button type="submit" className="w-full h-18 text-lg" isLoading={isLoading}>
          Confirmar Pedido & Pagar {formatPrice(total())}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </form>

      {/* Right Wall: Order Summary */}
      <aside className="lg:sticky lg:top-32 h-fit space-y-8">
        <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-[2.5rem] p-8 md:p-10 border border-neutral-100 dark:border-neutral-800 shadow-xl shadow-blue-500/5">
          <h3 className="text-2xl font-black tracking-tighter mb-8 italic">Tu Colección</h3>
          
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map((it) => (
              <div key={`${it.productId}-${it.variantId}`} className="flex gap-4 group">
                <div className="relative w-24 h-24 bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shrink-0 border dark:border-neutral-700 shadow-sm">
                  <Image src={it.imageUrl} alt={it.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1 flex flex-col py-0.5 justify-center">
                  <h4 className="text-sm font-bold line-clamp-2 leading-tight mb-1">{it.name}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] font-bold text-neutral-400 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-full border dark:border-neutral-700">
                      CANT: {it.quantity}
                    </span>
                    <span className="font-bold text-sm tracking-tight">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t-4 border-dotted border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex justify-between items-center text-neutral-500 font-medium tracking-tight">
              <span>Subtotal</span>
              <span className="font-bold text-neutral-900 dark:text-white">{formatPrice(total())}</span>
            </div>
            <div className="flex justify-between items-center text-neutral-500 font-medium tracking-tight">
              <span>Envío</span>
              <span className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Gratis Premium</span>
            </div>
            <div className="pt-4 flex justify-between items-end border-t dark:border-neutral-800">
              <span className="text-lg font-black tracking-tighter italic">TOTAL</span>
              <span className="text-3xl font-black tracking-tighter text-blue-600">{formatPrice(total())}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/30">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard className="w-24 h-24" />
          </div>
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Membresía Incluida</p>
          <p className="text-lg font-bold leading-tight relative z-10">
            Esta compra te otorga estatus de <span className="underline decoration-blue-300 underline-offset-4">Coleccionista Élite</span> automáticamente.
          </p>
        </div>
      </aside>
    </div>
  );
}
