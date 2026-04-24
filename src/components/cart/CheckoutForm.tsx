"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/lib/validators/checkout";
import { createOrderAction } from "@/actions/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowRight, CreditCard, Building2, Upload, AlertCircle, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/lib/uploadthing";

interface CheckoutFormProps {
  initialData?: Partial<CheckoutInput>;
}

export function CheckoutForm({ initialData }: CheckoutFormProps) {
  const t = useTranslations("Checkout");
  const { items, total, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: initialData,
  });
  
  const receiptUrl = watch("receiptUrl");

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      toast.error(t("empty"));
      router.push("/");
    }
  }, [items, router, isLoading, t]);

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

      const result = await createOrderAction(
        JSON.parse(JSON.stringify(data)), 
        JSON.parse(JSON.stringify(orderItems))
      );
      
      if (result.success) {
        toast.success(t("success"));
        clearCart();
        router.push(`/checkout/confirmado?orderId=${result.data.orderId}`);
      } else {
        toast.error(result.error || "Error al procesar el pedido");
      }
    } catch (error) {
      toast.error(t("error_conn"));
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
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">{t("details")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t("label_name")}
              placeholder={t("placeholder_name")}
              {...register("name")}
              error={errors.name?.message}
            />
            <Input
              label={t("label_email")}
              placeholder={t("placeholder_email")}
              {...register("email")}
              error={errors.email?.message}
            />
          </div>
          <Input
            label={t("label_phone")}
            placeholder={t("placeholder_phone")}
            {...register("phone")}
            error={errors.phone?.message}
          />
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">{t("payment")}</h2>
          </div>
          <div className="space-y-4">
            <div className="w-full space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">
                Banco Emisor
              </label>
              <select 
                {...register("bankName")}
                className="flex h-14 w-full rounded-md border-2 border-neutral-100 bg-white px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:border-blue-600 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white"
              >
                <option value="">Selecciona un banco</option>
                <option value="0102 - Banco de Venezuela">Banco de Venezuela (BDV)</option>
                <option value="0105 - Mercantil">Mercantil Banco</option>
                <option value="0108 - Provincial">BBVA Provincial</option>
                <option value="0134 - Banesco">Banesco</option>
                <option value="0172 - Bancamiga">Bancamiga</option>
                <option value="0114 - Bancaribe">Bancaribe</option>
                <option value="0115 - Exterior">Banco Exterior</option>
                <option value="0128 - Caroní">Banco Caroní</option>
                <option value="0151 - BNC">Banco Nacional de Crédito (BNC)</option>
                <option value="0163 - Tesoro">Banco del Tesoro</option>
                <option value="0168 - Bancrecer">Bancrecer</option>
                <option value="0171 - Activo">Banco Activo</option>
                <option value="0174 - Banplus">Banplus</option>
                <option value="0175 - Bicentenario">Banco Bicentenario</option>
                <option value="0191 - BND">BND (B.O.D)</option>
                <option value="Zelle">Zelle / Transferencia USA</option>
                <option value="Otros">Otros (Pago Móvil / Efectivo)</option>
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
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">{t("proof")}</h2>
          </div>
          <div className="space-y-4">
            {!receiptUrl ? (
              <div className="p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg text-center space-y-4 hover:border-blue-500/50 hover:bg-blue-50/10 transition-all cursor-pointer group relative">
                <UploadButton<OurFileRouter, "receiptImage">
                  endpoint="receiptImage"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) {
                      setValue("receiptUrl", res[0].ufsUrl);
                      toast.success("Comprobante subido correctamente");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Error al subir: ${error.message}`);
                  }}
                  content={{
                    button({ ready }) {
                      if (ready) return "Seleccionar Comprobante";
                      return "Preparando...";
                    },
                    allowedContent: "Imagen (Max 4MB)"
                  }}
                  appearance={{
                    button: "w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20",
                    allowedContent: "text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2"
                  }}
                />
              </div>
            ) : (
              <div className="relative group rounded-xl overflow-hidden border-2 border-blue-500 shadow-xl shadow-blue-500/10 animate-in zoom-in duration-300">
                <div className="relative aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-800">
                  <Image 
                    src={receiptUrl} 
                    alt="Comprobante de pago" 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain p-2"
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setValue("receiptUrl", "")}
                    className="px-4 py-2 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all transform hover:scale-105"
                  >
                    Eliminar y Cambiar
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur rounded-lg flex items-center gap-3 border shadow-lg">
                  <div className="p-1.5 bg-emerald-500 rounded-full">
                    <ArrowRight className="w-3 h-3 text-white rotate-[-45deg]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Comprobante Listo</span>
                </div>
              </div>
            )}
            
            {errors.receiptUrl && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.receiptUrl.message}</p>
            )}
          </div>
          <div className="flex gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-100 dark:border-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider leading-relaxed">
              Importante: Nuestro equipo verificará manualmente tu pago. El pedido se procesará una vez confirmado el depósito.
            </p>
          </div>
        </section>

        <Button type="submit" className="w-full h-18 text-lg" isLoading={isLoading}>
          {t("submit")} {formatPrice(total())}
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
                <Link 
                  href={`/producto/${it.slug}`}
                  className="relative w-24 h-24 bg-white dark:bg-neutral-800 rounded-md overflow-hidden shrink-0 border dark:border-neutral-700 shadow-sm hover:ring-2 hover:ring-blue-500 transition-all"
                >
                  <Image src={it.imageUrl} alt={it.name} fill sizes="96px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                </Link>
                <div className="flex-1 flex flex-col py-0.5 justify-center">
                  <h4 className="text-sm font-bold line-clamp-2 leading-tight mb-1">{it.name}</h4>
                  {it.type === "SERVICE" && (
                    <span className="inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 mb-1">
                      Servicio | Duración: {it.time}Hrs
                    </span>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] font-bold text-neutral-400 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-lg border dark:border-neutral-700">
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

        <div className="bg-blue-600 rounded-lg p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/30">
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
