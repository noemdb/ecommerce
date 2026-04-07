"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { productSchema, type ProductInput } from "@/lib/validators/product";
import { createProductAction, updateProductAction } from "@/actions/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Save, 
  X, 
  ChevronDown,
  Hash,
  AlertCircle,
  Package,
  Layers,
  Settings,
  Globe,
  Sparkles
} from "lucide-react";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/lib/uploadthing";
import { PromptForm } from "./PromptForm";

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface ProductFormProps {
  initialData?: any; // To allow for variations in initial data structure
  categories: Category[];
  suppliers: Supplier[];
}

export function ProductForm({ initialData, categories, suppliers }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [autoSlug, setAutoSlug] = useState(!initialData);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(productSchema.extend({
        images: z.array(z.string()).min(1, "Al menos una imagen requerida")
    })),
    defaultValues: initialData ? {
      name: initialData.name,
      slug: initialData.slug,
      description: initialData.description,
      price: initialData.price,
      promoPrice: initialData.promoPrice,
      sku: initialData.sku,
      stock: initialData.stock,
      lowStockThreshold: initialData.lowStockThreshold || 5,
      categoryId: initialData.categoryId,
      supplierId: initialData.supplierId || "",
      isFeatured: initialData.isFeatured || false,
      isBestSeller: initialData.isBestSeller || false,
      isMostSearched: initialData.isMostSearched || false,
      isNew: initialData.isNew || false,
      isActive: initialData.isActive ?? true,
      images: initialData.images?.map((img: any) => img.url) || [],
      metaTitle: initialData.metaTitle || "",
      metaDescription: initialData.metaDescription || ""
    } : {
      name: "",
      slug: "",
      description: "",
      price: 0,
      promoPrice: null,
      sku: "",
      stock: 0,
      lowStockThreshold: 5,
      categoryId: categories[0]?.id || "",
      supplierId: "",
      isFeatured: false,
      isBestSeller: false,
      isMostSearched: false,
      isNew: true,
      isActive: true,
      images: [],
      metaTitle: "",
      metaDescription: ""
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images" as any
  });

  const nameValue = watch("name");

  useEffect(() => {
    if (autoSlug && nameValue) {
      const slug = nameValue
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", slug);
    }
  }, [nameValue, autoSlug, setValue]);

  const onSubmit = (data: any) => {
    startTransition(async () => {
      const res = initialData 
        ? await updateProductAction(initialData.id, data)
        : await createProductAction(data);

      if (res.success) {
        toast.success(res.message);
        router.push("/admin/productos");
        router.refresh();
      } else {
        toast.error(res.error || "Ocurrió un error");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            {initialData ? "Editar Producto" : "Nuevo Producto"}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Completa los detalles del producto para el catálogo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isPending} className="gap-2">
            <Save className="w-4 h-4" />
            {initialData ? "Guardar Cambios" : "Crear Producto"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main info */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Basic Info */}
          <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="font-bold text-lg">Información Básica</h2>
            </div>

            <Input
              label="Nombre del Producto *"
              placeholder="Ej: Camiseta Premium Algodón"
              error={errors.name?.message as string}
              {...register("name")}
            />

            <div className="flex flex-col gap-2">
              <Input
                label="Slug (URL) *"
                placeholder="ej-camiseta-premium"
                error={errors.slug?.message as string}
                {...register("slug")}
                onChange={(e) => {
                  setAutoSlug(false);
                  register("slug").onChange(e);
                }}
              />
              {autoSlug && nameValue && (
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Sincronizado con el nombre
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">
                Descripción *
              </label>
              <textarea
                rows={5}
                className={cn(
                  "flex w-full rounded-2xl border-2 border-neutral-100 bg-white px-4 py-3 text-sm font-medium transition-all duration-300 placeholder:text-neutral-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white dark:placeholder:text-neutral-600 resize-none",
                  errors.description && "border-red-500"
                )}
                placeholder="Describe las características principales..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">
                  {errors.description.message as string}
                </p>
              )}
            </div>
          </section>

          {/* Media */}
          <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-purple-500" />
              </div>
              <h2 className="font-bold text-lg">Galería de Imágenes</h2>
            </div>

            <div className="space-y-4">
              {/* Display uploaded images */}
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="URL de imagen"
                      {...register(`images.${index}` as any)}
                      error={(errors.images as any)?.[index]?.message}
                    />
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mt-4 p-2 text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}

              {/* Upload Button */}
              <UploadButton<OurFileRouter, "productImage">
                endpoint="productImage"
                onClientUploadComplete={(res) => {
                  if (res) {
                    const urls = res.map((file) => file.url);
                    const currentImages = watch("images") || [];
                    setValue("images", [...currentImages, ...urls]);
                    toast.success("Imágenes subidas exitosamente");
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Error al subir imagen: ${error.message}`);
                }}
                className="w-full"
              />

              {errors.images && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">
                  {errors.images.message as string}
                </p>
              )}
            </div>
          </section>

          {/* AI Prompts Section (Only when editing) */}
          {initialData && (
            <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                  </div>
                  <h2 className="font-bold text-lg">Prompts de IA para Imágenes</h2>
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                {/* History of Prompts */}
                {initialData.prompts && initialData.prompts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Historial de Versiones</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {initialData.prompts.map((p: any) => (
                        <div key={p.id} className={cn(
                          "p-4 rounded-2xl border transition-all",
                          p.isActive 
                            ? "bg-blue-50/50 border-blue-200 dark:bg-blue-500/5 dark:border-blue-500/20" 
                            : "bg-neutral-50 border-neutral-100 dark:bg-neutral-800/50 dark:border-neutral-800"
                        )}>
                          <div className="flex justify-between items-start mb-2">
                             <span className={cn(
                               "text-[10px] font-black uppercase px-2 py-0.5 rounded-lg",
                               p.isActive ? "bg-blue-600 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
                             )}>
                               Versión {p.version} {p.isActive && "• Activa"}
                             </span>
                             <span className="text-[10px] text-neutral-400 font-bold">
                               {new Date(p.createdAt).toLocaleDateString()}
                             </span>
                          </div>
                          <p className="text-xs text-neutral-700 dark:text-neutral-300 italic line-clamp-3 leading-relaxed">
                            "{p.prompt}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Prompt Form */}
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1 mb-4">Añadir Nueva Versión</h3>
                  <PromptForm productId={initialData.id} onSuccess={() => router.refresh()} standalone={false} />
                </div>
              </div>
            </section>
          )}

          {/* SEO (Optional collapsible if needed, but for now flat) */}
          <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-emerald-500" />
              </div>
              <h2 className="font-bold text-lg">Optimización SEO (Opcional)</h2>
            </div>
            <Input label="Meta Título" placeholder="Nombre para buscadores..." {...register("metaTitle")} />
            <Input label="Meta Descripción" placeholder="Breve resumen para Google..." {...register("metaDescription")} />
          </section>
        </div>

        {/* Right Column: Pricing, Inventory, Organization */}
        <div className="flex flex-col gap-8">
          {/* Pricing & Stock */}
          <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Settings className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="font-bold text-lg">Precio e Inventario</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Precio Venta *" type="number" step="0.01" {...register("price")} error={errors.price?.message as string} />
              <Input label="Precio Promo" type="number" step="0.01" {...register("promoPrice")} error={errors.promoPrice?.message as string} />
            </div>

            <Input label="SKU / Código *" placeholder="PRO-001" {...register("sku")} error={errors.sku?.message as string} />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Stock *" type="number" {...register("stock")} error={errors.stock?.message as string} />
              <Input label="Alerta Stock Bajo" type="number" {...register("lowStockThreshold")} error={errors.lowStockThreshold?.message as string} />
            </div>
          </section>

          {/* Organization */}
          <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-neutral-500/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-neutral-500" />
              </div>
              <h2 className="font-bold text-lg">Organización</h2>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">
                  Categoría *
                </label>
                <div className="relative">
                  <select
                    className="flex h-14 w-full rounded-2xl border-2 border-neutral-100 bg-white px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white appearance-none pr-10"
                    {...register("categoryId")}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">
                  Proveedor
                </label>
                <div className="relative">
                  <select
                    className="flex h-14 w-full rounded-2xl border-2 border-neutral-100 bg-white px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white appearance-none pr-10"
                    {...register("supplierId")}
                  >
                    <option value="">Ninguno</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Toggles */}
          <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col gap-4 shadow-sm">
            <h2 className="font-bold text-lg mb-2">Visibilidad y Marcadores</h2>
            
            <div className="space-y-4">
              {[
                { label: "Producto Activo", key: "isActive" as const, desc: "Visible en la tienda" },
                { label: "Destacado", key: "isFeatured" as const, desc: "Aparece en el banner principal" },
                { label: "Más Vendido", key: "isBestSeller" as const, desc: "Badge de Best Seller" },
                { label: "Nuevo", key: "isNew" as const, desc: "Badge de Producto Nuevo" },
              ].map((toggle) => (
                <label key={toggle.key} className="flex items-center justify-between p-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{toggle.label}</span>
                    <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-tight">{toggle.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-lg border-2 border-neutral-200 dark:border-neutral-800 checked:bg-blue-600 transition-all cursor-pointer accent-blue-600"
                    {...register(toggle.key)}
                  />
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
