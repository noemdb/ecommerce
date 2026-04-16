import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, History, Lock, ShieldAlert, Users } from 'lucide-react';

export const StaffSection = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
        <ShieldCheck className="text-slate-600 w-6 h-6" />
        Gestión de Equipo (Tu Círculo de Confianza)
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
        No tienes que llevar toda la carga de la tienda. Puedes invitar a colaboradores con diferentes niveles de acceso para ayudarte a despachar, editar productos o moderar comentarios.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-5 rounded-2xl border bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/10 dark:to-indigo-950/10 border-indigo-100 dark:border-indigo-900/30 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-black shadow-lg shadow-purple-500/20">A</div>
          <div>
            <h4 className="font-bold text-purple-900 dark:text-purple-300">Administrador</h4>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">Poder Total</p>
          </div>
        </div>
        <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-400">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
            Accesos a finanzas y métricas de dinero.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
            Crear, editar o eliminar a otros miembros del staff.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
            Modificar configuraciones críticas del sitio.
          </li>
        </ul>
      </div>

      <div className="p-5 rounded-2xl border bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/10 dark:to-sky-950/10 border-blue-100 dark:border-blue-900/30 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/20">S</div>
          <div>
            <h4 className="font-bold text-blue-900 dark:text-blue-300">Staff Operativo</h4>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Gestión Diaria</p>
          </div>
        </div>
        <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-400">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
            Procesar órdenes, cambiar estados y guías de envío.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
            Añadir o editar productos en el catálogo.
          </li>
          <li className="flex items-start gap-2 font-bold text-blue-800 dark:text-blue-400 italic">
            <XCircle className="w-4 h-4 text-blue-300 shrink-0" />
            No puede ver ingresos totales ni borrar al jefe.
          </li>
        </ul>
      </div>
    </div>

    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 rounded-2xl shadow-sm">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 space-y-3">
          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <History className="w-5 h-5 text-orange-500" />
            Auditoría y Productividad (Trazabilidad)
          </h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            El sistema rastrea quién hizo qué. En la tabla de usuarios, verás la columna <strong>"Órdenes Auditadas"</strong>. Esto te indica cuántas ventas ha procesado cada miembro. Es una herramienta ideal para incentivar el buen desempeño.
          </p>
          <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-between shadow-inner">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Ejemplo de Rendimiento</span>
              <span className="text-[8px] text-neutral-400 italic">Basado en órdenes confirmadas</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-blue-600 tracking-tighter">142</span>
              <span className="text-[9px] uppercase font-bold text-neutral-400">Éxitos</span>
            </div>
          </div>
        </div>
        <div className="w-px h-16 bg-neutral-200 dark:bg-neutral-700 hidden md:block" />
        <div className="flex-1 space-y-3">
          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            Protocolos de Baja de Equipo
          </h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
            Cuando un colaborador se retira, <strong>no borres su cuenta de inmediato</strong>. Esto rompería el historial. Simplemente cambia su estado a <strong>"Inactivo"</strong>. Así bloqueas su acceso pero mantienes vivo el registro para futuras auditorías o reclamos.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-neutral-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold">Reglas de Oro: El Círculo de Confianza</h4>
            <p className="text-[10px] text-blue-200 italic">Prioriza la seguridad de la tienda sobre la comodidad.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <p className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-tighter">Password Único</p>
            <p className="text-[10px] text-neutral-400">Prohíbe que el staff comparta la misma contraseña. Cada acceso debe ser personal e intransferible.</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <p className="text-xs font-bold text-emerald-400 mb-1 uppercase tracking-tighter">Cierre de Sesión</p>
            <p className="text-[10px] text-neutral-400">Si se usan computadoras compartidas en el depósito, el staff DEBE cerrar sesión al terminar su turno.</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <p className="text-xs font-bold text-pink-400 mb-1 uppercase tracking-tighter">Niveles STAFF</p>
            <p className="text-[10px] text-neutral-400">El rol STAFF no ve márgenes de ganancia ni finanzas. Úsalo para todo lo que no sea gerencia.</p>
          </div>
        </div>
      </div>
      <Users className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 rotate-12 transition-transform group-hover:scale-110 duration-700" />
    </div>
  </div>
);
