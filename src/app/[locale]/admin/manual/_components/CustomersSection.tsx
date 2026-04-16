import React from 'react';
import { Users, Search, Download, Lightbulb, CheckCircle2, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react';

export const CustomersSection = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
        <Users className="text-blue-500 w-6 h-6" />
        Entendiendo tu Base de Clientes (Tu Agenda de Oro)
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
        Esta sección no es solo una lista de nombres; es el <strong>corazón de tu relación con el público</strong>. Aquí se almacenan todos los datos de quienes han confiado en tu tienda, permitiéndote conocer sus hábitos de compra y gestionar su privacidad.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <h4 className="font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-500" />
          Búsqueda y Filtros Rápidos
        </h4>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          ¿Un cliente te llamó por un retraso? No pierdas tiempo bajando en la lista. Usa la barra de búsqueda para encontrarlo instantáneamente por:
        </p>
        <ul className="grid grid-cols-2 gap-2 text-xs font-medium">
          <li className="bg-blue-50 dark:bg-blue-500/10 p-2 rounded border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-center">Nombre Real</li>
          <li className="bg-blue-50 dark:bg-blue-500/10 p-2 rounded border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-center">Correo Electrónico</li>
          <li className="bg-blue-50 dark:bg-blue-500/10 p-2 rounded border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-center">Teléfono</li>
          <li className="bg-blue-50 dark:bg-blue-500/10 p-2 rounded border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-center">Estado (Bloqueado)</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <h4 className="font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
          <Download className="w-5 h-5 text-emerald-500" />
          Exportación (Marketing y Contabilidad)
        </h4>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          ¿Vas a lanzar una campaña por WhatsApp o Email? Usa el botón <strong>"Exportar CSV"</strong>. 
        </p>
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
          <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-tight italic">
            <strong>Tip de Experto:</strong> Sube este archivo CSV a herramientas como Mailchimp o úsalo para crear tu lista de difusión y avisar sobre nuevas ofertas de temporada.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
      <div className="relative z-10">
        <h4 className="font-bold flex items-center gap-2 mb-3 text-lg">
          <Lightbulb className="w-6 h-6 text-yellow-300" />
          Identificando a tus "Clientes Oro"
        </h4>
        <p className="text-sm text-blue-50 leading-relaxed mb-4">
          En la tabla verás una columna llamada <strong>"Órdenes"</strong>. Este número te dice cuántas veces esa persona ha comprado en tu tienda.
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/20 flex-1">
            <p className="font-bold text-xs uppercase tracking-wider mb-1">Métrica VIP</p>
            <p className="text-xs text-blue-100">Si un cliente tiene más de 5 órdenes, ¡es un cliente leal! Considera enviarle un cupón de descuento especial por correo.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/20 flex-1">
            <p className="font-bold text-xs uppercase tracking-wider mb-1">Validación</p>
            <p className="text-xs text-blue-100">Busca el check verde de correo verificado. Esto te garantiza que no son perfiles falsos o bots.</p>
          </div>
        </div>
      </div>
      <Users className="absolute -right-8 -bottom-8 w-40 h-40 text-black/10 -rotate-12 transition-transform group-hover:scale-110 duration-700" />
    </div>

    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-inner">
      <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
        <ShieldCheck className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        Privacidad y Seguridad (Power User)
      </h4>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h5 className="font-bold text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
            <ShieldAlert className="w-4 h-4" />
            Bloqueo Preventivo
          </h5>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Usa esta función si detectas un usuario malintencionado que sube comprobantes de pago falsos repetidamente. Al bloquearlo, <strong>no podrá realizar más compras</strong> ni acceder a su perfil.
          </p>
        </div>

        <div className="space-y-3">
          <h5 className="font-bold text-sm flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <Trash2 className="w-4 h-4" />
            Derecho al Olvido (Purgado GDPR)
          </h5>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Si un cliente solicita legalmente borrar sus datos, verás un botón de <strong>"Purgar"</strong> (siempre que esté bloqueado previamente).
          </p>
          <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-100 dark:border-orange-900/30">
            <p className="text-[10px] text-orange-800 dark:text-orange-300 italic leading-snug">
              <strong>Atención:</strong> Esta acción no borra las facturas, pero <strong>anonimiza</strong> los datos. El nombre se convertirá en "Usuario Eliminado" y su email será borrado.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
