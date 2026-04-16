import React from 'react';
import { Tags, Plus, CheckCircle2, Package } from 'lucide-react';

export const ProductsSection = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
        <Tags className="text-purple-500 w-6 h-6" />
        Crear y Modificar el Catálogo (Tus Vitrinas)
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
        Añadir un producto en tu tienda no es sólo "llenar un formulario". Es el equivalente digital a <strong>limpiar el mostrador, planchar una camisa y ponerla en el maniquí principal</strong>. Es crucial que las "vitrinas" de tu tienda estén bonitas para generar confianza y provocar compras.
      </p>
    </div>

    <div className="grid lg:grid-cols-2 gap-4">
      <div className="bg-purple-50 dark:bg-purple-500/10 p-6 rounded-2xl border border-purple-200 dark:border-purple-500/20 shadow-sm">
        <h4 className="font-bold flex items-center gap-2 text-purple-800 dark:text-purple-300 mb-4 text-lg">
          <Plus className="w-5 h-5" />
          1. Identidad del Producto
        </h4>
        <div className="space-y-4 text-sm">
          <div>
            <strong className="block text-neutral-900 dark:text-neutral-100">Nomenclatura (Nombres):</strong>
            <p className="text-neutral-600 dark:text-neutral-400 mb-2">Sé directo. Escribe "Camisa Oxford Azul" en lugar de descripciones largas y confusas.</p>
            <div className="p-2 bg-white dark:bg-neutral-900 rounded border border-purple-100 dark:border-purple-900/50 text-[10px] italic">
               ✅ Correcto: "Smart Watch Series 9" <br/>
               ❌ Incorrecto: "reloj inteligente para iphone y android envio gratis oferta"
            </div>
          </div>
          <div>
            <strong className="block text-neutral-900 dark:text-neutral-100">Fotografía Profesional:</strong>
            <p className="text-neutral-600 dark:text-neutral-400">Sube fotos cuadradas (1:1). Las fotos con fondo neutro (blanco o gris claro) convierten 3 veces más que las fotos con ruido visual.</p>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 shadow-sm relative overflow-hidden group">
        <h4 className="font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-300 mb-4 text-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          2. Precios y Psicología
        </h4>
        <div className="space-y-4 text-sm relative z-10">
          <p className="text-neutral-600 dark:text-neutral-400">
            Usa el <strong>Precio Base</strong> para mostrar descuentos. Si el producto cuesta $50, pon Base en $70. El sistema tachará el $70 automáticamente, creando una sensación de oportunidad irresistible.
          </p>
          <div className="flex items-center gap-4 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800">
            <span className="text-neutral-400 line-through">$70.00</span>
            <span className="text-xl font-black text-emerald-600">$50.00</span>
            <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">-28%</span>
          </div>
        </div>
        <Tags className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-500/5 -rotate-12 transition-transform group-hover:scale-110 duration-700" />
      </div>
    </div>

    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 rounded-2xl shadow-sm">
      <h4 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-orange-500" />
        3. Almacén y Clasificación
      </h4>
      <div className="grid md:grid-cols-2 gap-8 text-sm">
        <div className="space-y-2">
          <p className="font-bold text-neutral-800 dark:text-neutral-200">Stock Inicial </p>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Dile al sistema cuántas unidades tienes físicamente. Si pones 0, el producto dirá <strong>"Agotado"</strong> en la web. No lo dejes vacío si quieres vender.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-bold text-neutral-800 dark:text-neutral-200">Relación con Proveedores</p>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Cada producto debe estar vinculado a un <strong>Proveedor</strong>. Esto te permitirá en el futuro saber quién te da más margen de ganancia o quién te entrega más rápido.
          </p>
        </div>
      </div>
    </div>
  </div>
);
