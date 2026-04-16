import React from 'react';
import { Settings, Globe, Palette, Smartphone, Eye, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const ConfigSection = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
        <Settings className="text-neutral-500 w-6 h-6" />
        Configuración del Sitio (Tu Manual de Identidad)
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
        Esta pantalla es la <strong>"Misión de Control"</strong>. Aquí decides el tono, los colores y las herramientas de contacto de tu tienda. No necesitas programar; solo llenar los campos y guardar.
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 hover:shadow-md transition-shadow">
        <Globe className="w-5 h-5 text-blue-500" />
        <h4 className="text-xs font-bold uppercase tracking-widest">Identidad & SEO</h4>
        <p className="text-[10px] text-neutral-500">Ajusta el nombre de la app, títulos y descripciones para aparecer de primero en Google.</p>
      </div>
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 hover:shadow-md transition-shadow">
        <Palette className="w-5 h-5 text-pink-500" />
        <h4 className="text-xs font-bold uppercase tracking-widest">Colores (Branding)</h4>
        <p className="text-[10px] text-neutral-500">Cambia los colores de botones y fondos. Los cambios se ven al instante en el frontend.</p>
      </div>
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 hover:shadow-md transition-shadow">
        <Smartphone className="w-5 h-5 text-emerald-500" />
        <h4 className="text-xs font-bold uppercase tracking-widest">WhatsApp FAB</h4>
        <p className="text-[10px] text-neutral-500">Configura el globo flotante de ayuda para que los clientes te contacten directo.</p>
      </div>
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 hover:shadow-md transition-shadow">
        <Eye className="w-5 h-5 text-indigo-500" />
        <h4 className="text-xs font-bold uppercase tracking-widest">Visibilidad</h4>
        <p className="text-[10px] text-neutral-500">Prende o apaga secciones completas (ej: ocultar el banner de Hero si no lo necesitas).</p>
      </div>
    </div>

    <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-2xl border-l-4 border-l-orange-500 space-y-4 shadow-inner">
      <div className="flex gap-4">
        <AlertCircle className="w-8 h-8 text-orange-500 shrink-0" />
        <div>
          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">Misión de Control (Branding & Tech)</h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
            Ciertos campos técnicos como <strong>"Google Analytics ID"</strong> o <strong>"Pixel ID"</strong> son para expertos. Si no tienes estos códigos, déjalos vacíos. Un error aquí no romperá el sitio, pero podría afectar tus estadísticas de marketing.
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <h5 className="font-bold text-xs mb-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-500" /> Redes Sociales
          </h5>
          <p className="text-[10px] text-neutral-500">Pega los enlaces completos de tu Instagram y Facebook. Esto habilitará automáticamente los iconos en el pie de página de tu tienda.</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <h5 className="font-bold text-xs mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" /> Políticas Legales
          </h5>
          <p className="text-[10px] text-neutral-500">Aquí defines tus términos de reembolso y envíos. Es la base legal que protege tu negocio ante reclamos de clientes.</p>
        </div>
      </div>
    </div>

    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between gap-6 overflow-hidden relative group">
      <div className="relative z-10 w-full md:w-3/4">
        <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          Publicación Inmediata
        </h4>
        <p className="text-sm text-slate-300 leading-relaxed">
          Al hacer clic en <strong>"Guardar Cambios"</strong>, la configuración se actualiza en tiempo real para todos tus compradores a nivel mundial. ¡Recuerda abrir tu propia tienda en otra pestaña para verificar que los nuevos colores se vean perfectos!
        </p>
      </div>
      <Settings className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12 transition-transform group-hover:scale-110 duration-700" />
    </div>
  </div>
);
