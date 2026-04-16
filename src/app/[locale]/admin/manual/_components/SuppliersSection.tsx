import React from 'react';
import { Truck, FileText, MapPin, ClipboardList, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const SuppliersSection = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
        <Truck className="text-teal-500 w-6 h-6" />
        Administrar Proveedores (Tus Fuentes de Suministro)
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
        Un negocio robusto depende de sus aliados. La base de datos de <strong>Proveedores</strong> te permite centralizar el contacto con fabricantes y distribuidores, manteniendo un histórico de quién te surte cada producto.
      </p>
    </div>

    <div className="grid lg:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 mb-3">
          <FileText className="w-5 h-5" />
        </div>
        <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 mb-1">Identificación RIF/NIT</h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Guarda el registro fiscal de tus aliados para procesos de facturación legal y auditorías internas.</p>
      </div>
      
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-3">
          <MapPin className="w-5 h-5" />
        </div>
        <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 mb-1">Logística y Dirección</h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Mantén a mano la dirección física de los depósitos o naves para coordinar retiros.</p>
      </div>

      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-3">
          <ClipboardList className="w-5 h-5" />
        </div>
        <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 mb-1">Términos Comerciales</h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Anota aquí los días de crédito, tiempos de entrega y descuentos pactados por volumen.</p>
      </div>
    </div>

    <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 p-5 rounded-2xl shadow-inner">
      <h4 className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-2 mb-3">
        <ClipboardList className="w-5 h-5" />
        ¿Por qué es vital vincular productos con proveedores?
      </h4>
      <div className="grid md:grid-cols-2 gap-6 text-sm">
        <div className="space-y-3">
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Cuando creas un producto en el catálogo, el sistema te pedirá asignarle un <strong>Proveedor</strong>. Esto habilita funciones críticas:
          </p>
          <ul className="space-y-2 text-xs font-medium text-teal-700 dark:text-teal-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Rastreo instantáneo de fallas de fábrica.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Reportes de rentabilidad por fuente de suministro.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Reposición de stock más eficiente.
            </li>
          </ul>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-teal-100 dark:border-teal-800 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Métrica de Inventario</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 italic">
            En la lista de proveedores verás una burbuja azul con el contador de productos únicos que ese proveedor tiene activos.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs font-black ring-2 ring-blue-500/20">12</span>
            <span className="text-[10px] font-bold text-neutral-400">Ejemplo: Este proveedor surte 12 modelos.</span>
          </div>
        </div>
      </div>
    </div>

    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20 shadow-sm">
        <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Estado: Inactivo
        </h4>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 italic font-medium">
          ¿Dejaste de trabajar con alguien? Cámbialo a <strong>Inactivo</strong>. Esto lo ocultará de las opciones al crear nuevos productos sin borrar su histórico.
        </p>
      </div>
      
      <div className="flex-1 bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-200 dark:border-red-500/20 shadow-sm">
        <h4 className="font-bold text-red-800 dark:text-red-400 text-sm mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Regla de Oro: Integridad
        </h4>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          El sistema <strong>no te permitirá eliminar</strong> un proveedor si todavía tiene productos asociados. Esto evita "datos huérfanos" en tu negocio.
        </p>
      </div>
    </div>
  </div>
);
