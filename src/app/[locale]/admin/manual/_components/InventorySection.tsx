import React from 'react';
import { Package, TrendingDown, AlertTriangle, BarChart3, History, Settings2 } from 'lucide-react';

export const InventorySection = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
        <Package className="text-orange-500 w-6 h-6" />
        Control de Inventario (Tu Almacén Inteligente)
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
        El inventario no es solo un conteo de cajas; es la <strong>salud financiera</strong> de tu negocio. El sistema te ofrece un radar en tiempo real para saber qué tienes, qué te falta y por qué se movió la mercadería.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-100 dark:border-red-500/20 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
          <TrendingDown className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xl font-black text-red-600">Sin Stock</p>
          <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">Venta bloqueada</p>
        </div>
      </div>
      <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xl font-black text-amber-600">Stock Bajo</p>
          <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">Hora de reponer</p>
        </div>
      </div>
      <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xl font-black text-blue-600">Óptimo</p>
          <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">Flujo saludable</p>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 rounded-2xl shadow-sm">
      <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-neutral-500" />
        Trazabilidad: El Historial de Movimientos
      </h4>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
        Cada vez que un producto entra o sale, el sistema lo anota con su <strong>fecha, hora y tipo</strong>. Ya no tendrás que adivinar quién ajustó el stock o cuándo se vendió la última unidad.
      </p>
      <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-inner">
        <h5 className="text-[10px] font-black uppercase text-neutral-400 mb-3 tracking-widest">Tipos de Movimiento:</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> ENTRADA (Carga de stock)
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600">
            <span className="w-2 h-2 rounded-full bg-red-500" /> SALIDA (Ajustes o faltantes)
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> VENTA (Descuento automático)
          </div>
        </div>
      </div>
    </div>

    <div className="p-6 bg-gradient-to-br from-neutral-800 to-black text-white rounded-2xl shadow-xl relative overflow-hidden group">
      <div className="relative z-10 w-full md:w-2/3">
        <h4 className="font-bold flex items-center gap-2 mb-2 text-lg">
          <Settings2 className="w-6 h-6 text-orange-400" />
          Ajustes Manuales con Lógica
        </h4>
        <p className="text-sm text-neutral-300 leading-relaxed">
          Si vas a cambiar el stock manualmente, el sistema te pedirá un <strong>Motivo</strong>. Úsalo para auditoría interna: <i>"Muestra regalada", "Producto dañado"</i> o <i>"Carga inicial"</i>. Así tu contabilidad será impecable.
        </p>
      </div>
      <Package className="absolute -right-6 -top-6 w-32 h-32 text-white/5 rotate-12 transition-transform group-hover:scale-110 duration-700" />
    </div>
  </div>
);
