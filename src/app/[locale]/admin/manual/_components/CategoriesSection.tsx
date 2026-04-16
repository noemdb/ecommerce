import React from 'react';
import { Layers, GripVertical, FolderTree, Hash } from 'lucide-react';

export const CategoriesSection = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
        <Layers className="text-indigo-500 w-6 h-6" />
        Organizar Categorías (Estructura de Ventas)
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
        Las categorías son los <strong>pasillos y estanterías</strong> de tu tienda. Una estructura desordenada confunde al cliente. El sistema te permite navegar en niveles y reordenar todo con un simple movimiento de ratón.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <h4 className="font-bold text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
          <GripVertical className="w-5 h-5" />
          Reordenamiento (Drag & Drop)
        </h4>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
          ¿Quieres que una categoría sea la primera que vean tus clientes? Simplemente <strong>mantén presionado el ícono de los puntos</strong> (Grip) y arrastra la categoría hacia arriba o abajo.
        </p>
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <p className="text-[10px] font-black uppercase text-neutral-400 tracking-tighter">Acción Recomendada:</p>
          <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 italic">"Pon tus categorías de temporada o liquidación siempre al principio."</p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-emerald-500" />
          Jerarquía Dinámica
        </h4>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Usa las <strong>Categorías Padre</strong> para agrupar grandes secciones (Ej: <i>Calzado</i>) y asigna hijos para mayor detalle (Ej: <i>Botas, Sandalias</i>). Esto genera un menú de navegación limpio y profesional.
        </p>
      </div>
    </div>

    <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl space-y-4 relative overflow-hidden group">
      <div className="flex items-center gap-4 relative z-10">
        <div className="bg-white/20 p-3 rounded-full shadow-lg">
          <Hash className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-lg">Slugs y URLs Amigables</h4>
          <p className="text-xs text-indigo-100 italic">El "Slug" es lo que aparecerá en la dirección web (Ej: <i>tienda.com/categorias/calzado-hombre</i>).</p>
        </div>
      </div>
      <p className="text-sm text-indigo-50 bg-indigo-700/50 p-3 rounded-lg border border-indigo-400/30 relative z-10">
        <strong>Pro-tip:</strong> Al crear una categoría, el sistema auto-genera el slug. No lo cambies una vez que el sitio esté en Google, ya que podrías romper los enlaces antiguos que ya se indexaron.
      </p>
      <Layers className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12 transition-transform group-hover:scale-110 duration-700" />
    </div>
  </div>
);
