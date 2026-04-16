import React from 'react';
import { MessageSquare, Star, Reply, AlertTriangle } from 'lucide-react';

export const ReviewsSection = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
        <MessageSquare className="text-pink-500 w-6 h-6" />
        Moderar Reseñas (Tu Reputación es Todo)
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
        Las reseñas son la <strong>"prueba social"</strong> que convence a nuevos clientes. El sistema te permite filtrar, aprobar y conversar con tus compradores.
      </p>
    </div>

    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-2xl shadow-sm">
      <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        El Ciclo de Vida de una Opinión
      </h4>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 shadow-inner">
          <span className="text-[10px] font-black uppercase text-neutral-400 px-2 py-1 bg-white dark:bg-neutral-800 rounded self-start">Etapa 1</span>
          <p className="text-xs font-bold">Pendientes</p>
          <p className="text-[11px] text-neutral-500">No son visibles en la tienda hasta que tú las autorices. Es tu filtro de seguridad.</p>
        </div>
        <div className="flex flex-col gap-2 p-3 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
          <span className="text-[10px] font-black uppercase text-emerald-600 px-2 py-1 bg-white dark:bg-neutral-900 rounded self-start">Etapa 2</span>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Aprobadas</p>
          <p className="text-[11px] text-emerald-800 dark:text-emerald-500">Aparecen públicamente en la página del producto. Ayudan a subir el rating promedio.</p>
        </div>
        <div className="flex flex-col gap-2 p-3 bg-red-50/50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-500/20 shadow-sm">
          <span className="text-[10px] font-black uppercase text-red-600 px-2 py-1 bg-white dark:bg-neutral-900 rounded self-start">Etapa 3</span>
          <p className="text-xs font-bold text-red-700 dark:text-red-400">Rechazadas</p>
          <p className="text-[11px] text-red-800 dark:text-red-500">Reseñas con spam o insultos. Desaparecen de la tienda pero quedan en tu registro.</p>
        </div>
      </div>
    </div>

    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-4">
        <div className="bg-blue-50 dark:bg-blue-500/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-500/20 relative overflow-hidden group hover:shadow-md transition-shadow">
          <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
            <Reply className="w-5 h-5" />
            El Arte de Responder
          </h4>
          <p className="text-sm text-blue-900 dark:text-blue-400 leading-relaxed mb-4">
            El sistema te permite escribir una <strong>Respuesta Admin</strong>. Esto es vital para:
          </p>
          <ul className="space-y-2 text-xs text-blue-800 dark:text-blue-400">
            <li className="flex items-center gap-2 font-medium">✨ Agradecer reseñas de 5 estrellas.</li>
            <li className="flex items-center gap-2 font-medium">⚠️ Ofrecer soluciones en críticas.</li>
            <li className="flex items-center gap-2 font-medium">📦 Aclarar dudas sobre el producto.</li>
          </ul>
          <Reply className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500/10 -rotate-12 transition-transform group-hover:scale-110 duration-700" />
        </div>
      </div>

      <div className="w-full lg:w-1/3 bg-neutral-50 dark:bg-neutral-800/50 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-inner">
        <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-pink-500" />
          ¿Cuándo Rechazar?
        </h4>
        <div className="space-y-3">
          <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
            <p className="text-[10px] font-black text-red-500 uppercase mb-1">Inaceptable</p>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic">"Este sitio es una estafa..." (Sin pruebas o insultos).</p>
          </div>
          <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
            <p className="text-[10px] font-black text-amber-500 uppercase mb-1">Gestionable</p>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic">"Llegó tarde..." → <strong>¡Aprobar y disculparse!</strong></p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
