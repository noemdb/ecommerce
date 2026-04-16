import React from 'react';
import { Server, Download, Database as DatabaseIcon, CheckCircle2, FileJson, AlertTriangle, Upload, RotateCcw } from 'lucide-react';

export const DatabaseSection = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
        <Server className="text-blue-600 w-6 h-6" />
        Gestión y Resguardo de Información
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
        Tu base de datos es el <strong>cerebro de la tienda</strong>. Contiene cada cliente, cada orden y cada centavo registrado. Esta sección te permite crear copias de seguridad, restaurar el sistema a un punto anterior o resetear la tienda si decides empezar de cero.
      </p>
    </div>

    <div className="grid lg:grid-cols-2 gap-4">
      <div className="bg-blue-50 dark:bg-blue-500/10 p-6 rounded-2xl border border-blue-200 dark:border-blue-500/20 shadow-sm relative overflow-hidden group">
        <h4 className="font-bold flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-4 text-lg">
          <Download className="w-6 h-6" />
          Respaldos (Backup)
        </h4>
        <div className="space-y-4 text-sm relative z-10">
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Al exportar, descargas un archivo <code>.json</code> con la "foto actual" de tu tienda. 
          </p>
          <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50 shadow-inner">
            <p className="font-bold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Rutina Semanal
            </p>
            <p className="text-[10px] text-neutral-500 italic">Descarga un respaldo cada viernes. Guárdalo en la nube o en un disco físico. Es tu seguro de vida ante cualquier imprevisto.</p>
          </div>
        </div>
        <DatabaseIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500/5 -rotate-12 transition-transform group-hover:scale-110 duration-700" />
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 shadow-sm relative overflow-hidden group">
        <h4 className="font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-300 mb-4 text-lg">
          <FileJson className="w-6 h-6" />
          Seeder (Inyector)
        </h4>
        <div className="space-y-4 text-sm relative z-10">
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            ¿Necesitas subir 500 productos de un golpe? El <strong>Seeder</strong> te permite cargar catálogos desde archivos JSON preparados por el equipo técnico.
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-black tracking-tighter">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-center">Upsert (Sube/Modifica)</div>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-center">Vinculación de Fotos</div>
          </div>
        </div>
        <FileJson className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-500/5 -rotate-12 transition-transform group-hover:scale-110 duration-700" />
      </div>
    </div>

    <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-2xl border border-red-200 dark:border-red-900/50 space-y-4 shadow-inner">
      <div className="flex gap-4">
        <div className="p-3 bg-red-600 rounded-full shadow-lg shadow-red-600/20 shrink-0">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-red-900 dark:text-red-400 mb-1 text-lg">Operaciones Destructivas (Precaución)</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            La <strong>Restauración</strong> y el <strong>Reinicio de Fábrica</strong> son irreversibles. No uses estas funciones a menos que sea una emergencia o que desees limpiar la tienda por completo.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-red-100 dark:border-red-950 shadow-sm">
          <p className="font-bold text-xs mb-1 flex items-center gap-1">
            <Upload className="w-3 h-3 text-red-500" /> Restaurar
          </p>
          <p className="text-[10px] text-neutral-500 italic">Sustituye la tienda actual por un respaldo previo. Todo lo nuevo entre el hoy y el backup se perderá.</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-red-100 dark:border-red-950 shadow-sm">
          <p className="font-bold text-xs mb-1 flex items-center gap-1">
            <RotateCcw className="w-3 h-3 text-red-500" /> Reset Inicial
          </p>
          <p className="text-[10px] text-neutral-500 italic">Borra órdenes, clientes y productos personalizados. Vuelve a la configuración de "Demo" original.</p>
        </div>
      </div>
    </div>
  </div>
);
