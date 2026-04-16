import React from 'react';
import { ShoppingBag, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const OrdersSection = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
        <ShoppingBag className="text-emerald-500 w-6 h-6" />
        ¿Cómo atender un pedido (y no volverte loco)?
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
        La sección <strong>Órdenes</strong> es el corazón de tu negocio. Cuando un cliente hace clic en "Comprar" en tu tienda, toda la información (qué compró, a dónde enviarlo, si pagó o no) cae en esta bandeja.
      </p>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
        Tu trabajo es actuar como el director de una orquesta: deberás ir <strong>cambiando el estado del pedido</strong> para que, detrás de escena, el sistema le mande correos automáticos al cliente avisándole que su paquete está avanzando.
      </p>
    </div>

    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-xl shadow-sm">
      <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4">El Ciclo de Vida de una Orden (Paso a Paso)</h4>
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 dark:before:via-neutral-700 before:to-transparent">
        
        {/* Paso 1 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-neutral-900 bg-amber-100 text-amber-600 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
            1
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20 shadow-sm">
            <h5 className="font-bold text-amber-800 dark:text-amber-400">Pendiente</h5>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">El cliente dijo "Lo quiero" y subió una foto de su recibo de transferencia (o seleccionó tarjeta). Aún NO debes mandar el paquete. Tu trabajo: Ir al banco en tu celular y confirmar que el dinero cayó.</p>
          </div>
        </div>

        {/* Paso 2 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-neutral-900 bg-blue-100 text-blue-600 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
            2
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-200 dark:border-blue-500/20 shadow-sm">
            <h5 className="font-bold text-blue-800 dark:text-blue-400">Pagado & Procesando</h5>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">¡El dinero está seguro! Entra al pedido y cámbialo a <strong>Pagado</strong>, y luego a <strong>Procesando</strong>. Esto le dice al cliente: "Recibí tu dinero, estoy metiendo el producto en la caja".</p>
          </div>
        </div>

        {/* Paso 3 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-neutral-900 bg-indigo-100 text-indigo-600 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
            3
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
            <h5 className="font-bold text-indigo-800 dark:text-indigo-400">Enviado (Despachado)</h5>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Le entregaste la caja al motorizado o a la empresa de envíos. Cambia el estado a <strong>Enviado</strong> y agrega el número de guía (tracking) si lo tienes.</p>
          </div>
        </div>

        {/* Paso 4 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-neutral-900 bg-emerald-100 text-emerald-600 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
            4
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
            <h5 className="font-bold text-emerald-800 dark:text-emerald-400">Completado</h5>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">El cliente te escribió diciendo "¡Lo amé, ya lo recibí!". Sólo entonces, lo marcas como Completado. ¡Felicidades, ganaste!</p>
          </div>
        </div>

      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-200 dark:border-red-500/20 shadow-sm">
        <h4 className="font-bold flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
          <AlertTriangle className="w-5 h-5" />
          Estado: Cancelado
        </h4>
        <p className="text-sm text-red-800 dark:text-red-300">
          Si revisas tu banco y resulta ser un comprobante falso, o simplemente el cliente no pagó en 24 horas, cambia el estado a <strong>Cancelado</strong>. Al hacer esto, el sistema <strong>le regresará mágicamente el inventario a la tienda</strong> para que alguien más lo pueda comprar.
        </p>
      </div>
      
      <div className="bg-yellow-50 dark:bg-yellow-500/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-500/20 shadow-sm">
        <h4 className="font-bold flex items-center gap-2 text-yellow-700 dark:text-yellow-400 mb-2">
          <CheckCircle2 className="w-5 h-5" />
          ¿El cliente se entera?
        </h4>
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          Absolutamente sí. Cada vez que tú modificas un estado, la tienda virtual le envía instantáneamente un correo muy profesional al cliente informándole de las buenas noticias. Es por ello que no puedes "saltarte" pasos a la ligera.
        </p>
      </div>
    </div>
  </div>
);
