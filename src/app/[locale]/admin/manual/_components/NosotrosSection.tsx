import React from 'react';
import { UserCircle, LayoutList, GripVertical, FileText, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

export const NosotrosSection = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
        <UserCircle className="text-neutral-500 w-6 h-6" />
        Módulo "Nosotros" (Perfil del Negocio)
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
        Este módulo te permite crear una página pública altamente dinámica para presentarte a ti o a tu empresa. Funciona mediante un perfil principal y múltiples secciones personalizables.
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 hover:shadow-md transition-shadow">
        <UserCircle className="w-5 h-5 text-blue-500" />
        <h4 className="text-xs font-bold uppercase tracking-widest">Perfil Base</h4>
        <p className="text-[10px] text-neutral-500">Configura tu foto, nombre completo, bio general y enlace a tu currículo. Estos datos alimentan la cabecera (Hero) de la página pública y optimizan el SEO automático.</p>
      </div>
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 hover:shadow-md transition-shadow">
        <LayoutList className="w-5 h-5 text-emerald-500" />
        <h4 className="text-xs font-bold uppercase tracking-widest">Secciones Modulares</h4>
        <p className="text-[10px] text-neutral-500">Crea cajas de información (ej. "Habilidades", "Experiencia"). Puedes reordenarlas usando las flechas, ocultarlas temporalmente o publicarlas cuando estén listas.</p>
      </div>
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 hover:shadow-md transition-shadow">
        <FileText className="w-5 h-5 text-indigo-500" />
        <h4 className="text-xs font-bold uppercase tracking-widest">Campos Flexibles</h4>
        <p className="text-[10px] text-neutral-500">Dentro de cada sección, puedes agregar campos de diferentes tipos: texto plano, HTML, imágenes, fechas, números y enlaces, cada uno con un formato visual único.</p>
      </div>
    </div>

    <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-2xl border-l-4 border-l-blue-500 space-y-4 shadow-inner">
      <div className="flex gap-4">
        <GripVertical className="w-8 h-8 text-blue-500 shrink-0" />
        <div>
          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">Gestión de Contenido Dinámico</h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            La creación de tu página "Nosotros" se divide en dos pasos: primero defines <strong>la estructura</strong> (las secciones) y luego <strong>el contenido</strong> (los campos internos). 
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <h5 className="font-bold text-xs mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" /> Estado: Borrador vs Publicado
          </h5>
          <p className="text-[10px] text-neutral-500">
            Una sección en <strong>Borrador</strong> jamás será vista por tus clientes. Puedes llenarla de contenido con calma y cambiarla a <strong>Publicada</strong> cuando sea perfecta.
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <h5 className="font-bold text-xs mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" /> Secciones Vacías
          </h5>
          <p className="text-[10px] text-neutral-500">
            Si publicas una sección pero aún no tiene ningún campo interno, igualmente se visualizará su recuadro y su título en la página pública a modo de "Próximamente" o título separador.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between gap-6 overflow-hidden relative group">
      <div className="relative z-10 w-full md:w-3/4">
        <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          Sanitización HTML Automática
        </h4>
        <p className="text-sm text-slate-300 leading-relaxed">
          Los campos de tipo <strong>HTML</strong> te permiten inyectar etiquetas personalizadas de marcado (como negritas, listas o enlaces en un párrafo). Por seguridad, el sistema limpia este código antes de guardarlo en la base de datos previniendo ataques maliciosos (XSS).
        </p>
      </div>
      <UserCircle className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12 transition-transform group-hover:scale-110 duration-700" />
    </div>
  </div>
);
