import React from 'react';
import { LayoutDashboard, BarChart3, TrendingDown, History, BookOpen, CheckCircle2 } from 'lucide-react';

export const DashboardSection = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
        <LayoutDashboard className="text-blue-500 w-6 h-6" />
        Primeros Pasos y Tu Panel Principal
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
        ¡Bienvenido a tu panel de administración! Aquí es donde controlas cada tuerca y tornillo de tu tienda virtual. Piensa en esta pantalla principal como el <strong>"tablero de tu coche"</strong>: no necesitas ser un mecánico experto para saber si tienes gasolina, a qué velocidad vas, o si una luz roja de advertencia se ha encendido. 
      </p>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
        Tu <strong>Dashboard</strong> (o Panel Principal) es lo primero que ves al iniciar sesión. Su función es darte un resumen rápido de la "salud" de tu negocio durante el día o el mes. Es tu radar.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-blue-50 dark:bg-blue-500/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-500/20 relative overflow-hidden group">
        <h4 className="font-bold flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-4 text-lg">
          <BarChart3 className="w-6 h-6" />
          Tus 4 Métricas Vitales
        </h4>
        <div className="space-y-4 text-sm relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-900 flex items-center justify-center shadow-sm text-blue-600 font-bold shrink-0">V</div>
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-300">Ventas Totales</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Ingresos brutos del mes. Tu meta financiera.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-900 flex items-center justify-center shadow-sm text-blue-600 font-bold shrink-0">O</div>
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-300">Órdenes Pendientes</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">¡Tu lista de tareas! Paquetes por preparar.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-900 flex items-center justify-center shadow-sm text-blue-600 font-bold shrink-0">C</div>
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-300">Clientes Nuevos</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Nuevos registros atraídos por tu marketing.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-900 flex items-center justify-center shadow-sm text-blue-600 font-bold shrink-0">R</div>
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-300">Rendimiento (%)</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Comparativa contra la semana pasada. <span className="text-emerald-600 font-bold">Verde = Subes</span>, <span className="text-red-600 font-bold">Rojo = Caes</span>.</p>
            </div>
          </div>
        </div>
        <TrendingDown className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500/5 -rotate-12 transition-transform group-hover:scale-110 duration-700" />
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-2">
            <History className="w-5 h-5 text-neutral-400" />
            Curva de Demanda
          </h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            La gráfica de líneas central te muestra los <strong>picos de compras</strong>. Identifica si tus clientes compran más los viernes o los lunes para planificar tus ofertas de Instagram.
          </p>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neutral-400" />
            Navegación Eficiente
          </h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            El menú lateral es tu centro de transporte. Si necesitas más espacio para ver tus gráficas o tablas, puedes <strong>colapsar el menú</strong> haciendo clic en el icono del logo.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-neutral-800 text-white p-5 rounded-2xl border-l-4 border-l-blue-500 shadow-xl flex items-center gap-4">
      <div className="bg-blue-500 p-3 rounded-full shadow-lg shadow-blue-500/20">
        <CheckCircle2 className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-medium leading-relaxed">
        <strong>🎯 Rutina Sugerida:</strong> Inicia el día revisando las "Órdenes Pendientes". No hay nada que dé mejor impresión que un despacho rápido en las primeras horas de la mañana.
      </p>
    </div>
  </div>
);
