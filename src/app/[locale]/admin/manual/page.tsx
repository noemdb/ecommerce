"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Tags, 
  Users, 
  Truck, 
  MessageSquare, 
  ShieldCheck, 
  Settings,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const MANUAL_SECTIONS = [
  {
    id: "dashboard",
    title: "1. Primeros Pasos",
    icon: LayoutDashboard,
    content: (
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
          <div className="bg-blue-50 dark:bg-blue-500/10 p-5 rounded-xl border border-blue-100 dark:border-blue-500/20">
            <h4 className="font-bold flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-3 text-lg">
              <Lightbulb className="w-5 h-5" />
              Tus 4 Métricas Vitales
            </h4>
            <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
              <li className="flex items-start gap-2">
                <strong className="text-blue-700 dark:text-blue-400 min-w-28 mt-0.5">💰 Ventas Totales:</strong> 
                <span>El dinero (ingresos brutos) que entró a la tienda. Te sirve para saber si estás alcanzando tus metas del mes.</span>
              </li>
              <li className="flex items-start gap-2">
                <strong className="text-blue-700 dark:text-blue-400 min-w-28 mt-0.5">📦 Órdenes Pendientes:</strong> 
                <span>¡Tu lista de tareas! Este número indica cuántos clientes pagaron pero aún no han recibido o no se les ha despachado su pedido. ¡Si este número es alto, significa que hay que ir a empaquetar!</span>
              </li>
              <li className="flex items-start gap-2">
                <strong className="text-blue-700 dark:text-blue-400 min-w-28 mt-0.5">👥 Clientes Nuevos:</strong> 
                <span>Personas que se registraron recientemente en tu base de datos. Indica qué tan bien están funcionando tus campañas de redes sociales.</span>
              </li>
              <li className="flex items-start gap-2">
                <strong className="text-blue-700 dark:text-blue-400 min-w-28 mt-0.5">📉 Rendimiento:</strong> 
                <span>Un porcentaje (ej. +15%) que compara tu rendimiento actual con el de la semana pasada. Verde es bueno (crecimiento), rojo significa que cayeron las ventas ligeramente.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl shadow-sm">
              <h4 className="font-bold text-neutral-800 dark:text-neutral-200 mb-2">Entendiendo las Gráficas</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                La gráfica de líneas central te muestra los <strong>picos de compras</strong>. Si ves una montaña alta los viernes por la noche, significa que es la hora pico en tu tienda. Usa esto a tu favor: ¡Sube tus productos más bonitos o publica promociones en Instagram justo antes de esos picos de actividad!
              </p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl shadow-sm">
              <h4 className="font-bold text-neutral-800 dark:text-neutral-200 mb-2">El Menú Lateral Izquierdo</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Es la barra de herramientas principal. Cada botón te transporta a una habitación diferente de tu negocio (ej. "Productos" es el almacén físico, "Usuarios" es el departamento de recursos humanos). Puedes <strong>ocultarlo o desplegarlo</strong> haciendo clic en la flechita cerca del logotipo para ganar más espacio en pantalla.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            <strong>🎯 Tu rutina sugerida de la mañana:</strong> Entra al Dashboard con tu taza de café, verifica que las "Ventas" sean correctas, revisa urgencias y ve directo a la pestaña de "Órdenes Pendientes" para comenzar tu día productivo.
          </p>
        </div>
      </div>
    )
  },
  {
    id: "ordenes",
    title: "2. Procesar Pedidos",
    icon: ShoppingBag,
    content: (
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
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20">
                <h5 className="font-bold text-amber-800 dark:text-amber-400">Pendiente</h5>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">El cliente dijo "Lo quiero" y subió una foto de su recibo de transferencia (o seleccionó tarjeta). Aún NO debes mandar el paquete. Tu trabajo: Ir al banco en tu celular y confirmar que el dinero cayó.</p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-neutral-900 bg-blue-100 text-blue-600 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                2
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-200 dark:border-blue-500/20">
                <h5 className="font-bold text-blue-800 dark:text-blue-400">Pagado & Procesando</h5>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">¡El dinero está seguro! Entra al pedido y cámbialo a <strong>Pagado</strong>, y luego a <strong>Procesando</strong>. Esto le dice al cliente: "Recibí tu dinero, estoy metiendo el producto en la caja".</p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-neutral-900 bg-indigo-100 text-indigo-600 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                3
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
                <h5 className="font-bold text-indigo-800 dark:text-indigo-400">Enviado (Despachado)</h5>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Le entregaste la caja al motorizado o a la empresa de envíos. Cambia el estado a <strong>Enviado</strong> y agrega el número de guía (tracking) si lo tienes.</p>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-neutral-900 bg-emerald-100 text-emerald-600 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                4
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                <h5 className="font-bold text-emerald-800 dark:text-emerald-400">Completado</h5>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">El cliente te escribió diciendo "¡Lo amé, ya lo recibí!". Sólo entonces, lo marcas como Completado. ¡Felicidades, ganaste!</p>
              </div>
            </div>

          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-200 dark:border-red-500/20">
            <h4 className="font-bold flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              Estado: Cancelado
            </h4>
            <p className="text-sm text-red-800 dark:text-red-300">
              Si revisas tu banco y resulta ser un comprobante fáctico, o simplemente el cliente no pagó en 24 horas, cambia el estado a <strong>Cancelado</strong>. Al hacer esto, el sistema <strong>le regresará mágicamente el inventario a la tienda</strong> para que alguien más lo pueda comprar.
            </p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-500/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-500/20">
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
    )
  },
  {
    id: "productos",
    title: "3. Añadir Productos",
    icon: Tags,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <Tags className="text-purple-500 w-6 h-6" />
            Crear y Modificar el Catálogo (Tus Vitrinas)
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
            Añadir un producto en tu tienda no es sólo "llenar un formulario". Es el equivalente digital a <strong>limpiar el mostrador, planchar una camisa y ponerla en el maniquí principal</strong>. Es crucial que las "vitrinas" de tu tienda estén bonitas para generar confianza y provocar compras.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-purple-50 dark:bg-purple-500/10 p-5 rounded-xl border border-purple-200 dark:border-purple-500/20">
            <h4 className="font-bold flex items-center gap-2 text-purple-800 dark:text-purple-300 mb-3 text-lg">
              <CheckCircle2 className="w-5 h-5" />
              1. Nomenclatura y Fotografía
            </h4>
            <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
              <li>
                <strong className="block text-purple-700 dark:text-purple-400 mb-1">Nombre Claro y Conciso:</strong>
                No escribas <i>"super camisa algodon 100% varon"</i>. Escribe <strong>"Camisa Oxford Azul"</strong>. Si quieres poner "100% algodón", escríbelo abajo en la descripción larga.
              </li>
              <li>
                <strong className="block text-purple-700 dark:text-purple-400 mb-1">Carga de Imágenes:</strong>
                Sube la foto frontal como principal. Asegúrate de que todas tus fotos sean cuadradas (relación 1:1) o rectangulares (16:9), <strong>pero mantén un estándar en toda la tienda</strong>. Las fotos borrosas asustan a los clientes.
              </li>
            </ul>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
            <h4 className="font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-300 mb-3 text-lg">
              <Lightbulb className="w-5 h-5" />
              2. Precios y La Sicología del Descuento
            </h4>
            <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
              <li>
                <strong className="block text-emerald-700 dark:text-emerald-400 mb-1">Precio Base vs. Precio de Oferta:</strong>
                Si tu producto cuesta $50, escribe $50 en el Precio. Pero si quieres dar la ilusión de oferta, pon el Precio Base en $70 y el Precio de Promoción en $50. El sistema tachará el $70 automáticamente y le pondrá una etiqueta de "Descuento" roja súper atractiva.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-xl shadow-sm">
          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-4">
            <LayoutDashboard className="w-5 h-5 text-neutral-500" />
            3. Inventario y Categorías
          </h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-bold text-sm text-neutral-700 dark:text-neutral-300 mb-2">Stock Inicial (No mientas al sistema)</h5>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Al crear un producto, debes decirle al sistema cuántas unidades tienes físicamente. Si pones 10, el sistema bloqueará compras una vez que 10 personas compren. Si pones 0, aparecerá con un botón gris de "Agotado".
              </p>
            </div>
            <div>
              <h5 className="font-bold text-sm text-neutral-700 dark:text-neutral-300 mb-2">Asignarle una Categoría</h5>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Selecciona la "caja" correcta donde va este producto (Ej: Ropa, Electrónica). Si no la asignas, el cliente nunca la encontrará por el buscador. También debes decirle de qué <strong>Proveedor</strong> vino, esto te servirá para reportes internos más adelante.
              </p>
            </div>
          </div>
        </div>

      </div>
    )
  },
  {
    id: "inventario",
    title: "4. Inventario",
    icon: Package,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <Package className="text-orange-500 w-6 h-6" />
            Control de Inventario (Evitar "Vender Aire")
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
            El inventario no es solo un contador; es la <strong>promesa</strong> que le haces a tu cliente. Si el sistema dice que hay 1 unidad, el cliente espera recibirla. Gestionar esto correctamente evita devoluciones, quejas y pérdida de reputación.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold mb-3 shadow-lg shadow-emerald-500/20">✓</div>
            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1 uppercase tracking-wider">Saludable</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Tienes mercadería suficiente. Los clientes pueden comprar sin restricciones.</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold mb-3 shadow-lg shadow-amber-500/20">!</div>
            <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-1 uppercase tracking-wider">Stock Bajo</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">El sistema te avisará en amarillo cuando queden pocas unidades. ¡Hora de llamar al proveedor!</p>
          </div>
          <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-100 dark:border-red-500/20 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold mb-3 shadow-lg shadow-red-500/20">✕</div>
            <h4 className="font-bold text-red-800 dark:text-red-300 text-sm mb-1 uppercase tracking-wider">Agotado</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">El producto se bloquea automáticamente para evitar ventas de artículos que no tienes físicamente.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-xl shadow-sm">
          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-orange-500" />
            ¿Cómo actualizar el Stock correctamente?
          </h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 w-6 h-6 flex items-center justify-center rounded-md font-bold text-xs shrink-0">1</div>
              <div>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Recepción de Mercadería</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Cuando llegue mercadería nueva, usa el botón "Añadir Stock". No borres y escribas el total; simplemente suma lo que acaba de entrar (ej: +20).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 w-6 h-6 flex items-center justify-center rounded-md font-bold text-xs shrink-0">2</div>
              <div>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Ajuste por Daños o Merma</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Si un producto se rompió en el almacén, debes restarlo manualmente. Esto se llama "Ajuste de Salida" y mantiene tu contabilidad real.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <h4 className="font-bold flex items-center gap-2 mb-2 text-lg">
              <CheckCircle2 className="w-6 h-6 text-blue-200" />
              Pro-Tip: La Sincronización Automática
            </h4>
            <p className="text-sm text-blue-50 leading-relaxed max-w-[85%]">
              Recuerda que cada vez que alguien paga una orden, el sistema <strong>resta automáticamente</strong> el producto de tu inventario. No necesitas hacerlo tú manualmente. Solo debes intervenir cuando entra mercadería nueva o cuando realizas auditorías físicas.
            </p>
          </div>
          <Package className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12 transition-transform group-hover:scale-110 duration-500" />
        </div>
      </div>
    )
  },
  {
    id: "categorias",
    title: "5. Categorías",
    icon: LayoutDashboard,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <LayoutDashboard className="text-indigo-500 w-6 h-6" />
            Organizar tus Categorías (Arquitectura)
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
            Las categorías son los <strong>pasillos y estanterías</strong> de tu tienda. Una estructura desordenada confunde al cliente y hace que abandone el carrito. El sistema te permite crear una arquitectura "infinita", pero la clave es la simplicidad.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-xl shadow-sm">
            <h4 className="font-bold text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Jerarquía y Subcategorías
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              No todas las categorías son iguales. Puedes tener categorías "Padre" (ej. <i>Mujer</i>) y "Hijas" (ej. <i>Vestidos</i>, <i>Calzado</i>). 
            </p>
            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
              <p className="text-xs font-mono text-indigo-800 dark:text-indigo-300">
                📁 Ropa Mujer <br/>
                &nbsp;&nbsp;╰── 👗 Vestidos <br/>
                &nbsp;&nbsp;╰── 👠 Tacones
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-xl shadow-sm">
            <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-emerald-500" />
              Drag & Drop (Orden Visual)
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              El orden en que aparecen las categorías en tu página principal es totalmente personalizable. Solo debes <strong>mantener presionado y arrastrar</strong> las tarjetas en el panel de administración para priorizar lo que quieres que tus clientes vean primero.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-500/10 p-5 rounded-xl border border-blue-100 dark:border-blue-500/20">
          <h4 className="font-bold flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-3 text-lg">
            <Lightbulb className="w-5 h-5" />
            La importancia del "Slug" y SEO
          </h4>
          <div className="grid md:grid-cols-2 gap-6">
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              El <strong>Slug</strong> es la parte de la dirección web que identifica a la categoría (ej. <i>mitienda.com/ropa-hombre</i>). El sistema lo genera automáticamente al escribir el nombre, pero puedes editarlo. 
              <br/><br/>
              <strong>Regla de Oro:</strong> Una vez que la categoría está pública en Google, evita cambiar el slug, ya que esto rompería los enlaces antiguos.
            </p>
            <div className="space-y-3">
              <div className="bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <p className="text-[10px] text-neutral-400 uppercase font-bold mb-1">Visibilidad</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                  Puedes desactivar categorías (ej. "Liquidación de Navidad") para que desaparezcan de la tienda sin borrarlas, guardándolas para el próximo año.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "clientes",
    title: "6. Clientes",
    icon: Users,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <Users className="text-blue-400 w-6 h-6" />
            Entendiendo tu Base de Clientes
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Aquí vas a ver un listado de todas las personas que han comprado en tu tienda o han creado una cuenta. Es tu libreta de contactos virtual.
          </p>
        </div>

        <p className="text-neutral-600 dark:text-neutral-400">
          Puedes usar esto para ver <strong>quiénes son tus mejores clientes</strong> (los que más compran) o revisar si alguien registró mal su correo. Además, si tienes problemas con un comprador malintencionado, desde aquí puedes restringir sus acciones.
        </p>
      </div>
    )
  },
  {
    id: "proveedores",
    title: "7. Proveedores",
    icon: Truck,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <Truck className="text-teal-500 w-6 h-6" />
            Administrar Proveedores
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Esta sección es interna. Tus clientes no la ven, pero a ti te sirve mucho. Aquí anotas qué empresas o personas te surten los productos.
          </p>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">
          <strong>¿Para qué sirve?</strong> Cuando vayas a agregar productos, podrás decir "Estos zapatos me los trae el proveedor X". Así, a fin de mes, sabrás qué proveedor te está generando más ganancias y tendrás sus datos de contacto (teléfono y nombre del agente) a la mano si hay un retraso.
        </p>
      </div>
    )
  },
  {
    id: "resenas",
    title: "8. Reseñas",
    icon: MessageSquare,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <MessageSquare className="text-pink-500 w-6 h-6" />
            Moderar las Reseñas
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            ¡Las personas hablan de ti! En la sección de <strong>Reseñas</strong> caen todos los comentarios estrellitas que los usuarios dejan en tus productos.
          </p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-100 dark:border-red-500/20">
          <h4 className="font-bold flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            Evitar insultos y Spam
          </h4>
          <p className="text-sm text-red-800 dark:text-red-300">
            A veces hay personas maliciosas que dejan comentarios falsos. Tienes el poder de "Ocultar" una reseña para que no aparezca públicamente en tu tienda, o puedes entrar y "Aprobarla" si es una reseña real. <i>¡Sé ético, no borres reseñas críticas si son ciertas, sino resuélvelas y contesta!</i>
          </p>
        </div>
      </div>
    )
  },
  {
    id: "staff",
    title: "9. Usuarios (Staff)",
    icon: ShieldCheck,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <ShieldCheck className="text-slate-500 w-6 h-6" />
            Equipo de Trabajo (Roles)
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            No tienes que hacer todo tú solo. Puedes crearle un usuario "empleado" a tus trabajadores en la sección <strong>Usuarios</strong>.
          </p>
        </div>

        <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          <li><strong>Administrador:</strong> Tú, que tienes el poder total y accedes a las métricas y configuraciones más profundas de dinero.</li>
          <li><strong>Moderador/Staff:</strong> Tu empelado que solo va a despachar órdenes o contestar reseñas, pero que no puede borrar productos del sistema ni manipular pagos críticos.</li>
        </ul>
      </div>
    )
  },
  {
    id: "config",
    title: "10. Config. Sitio",
    icon: Settings,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <Settings className="text-neutral-500 w-6 h-6" />
            Ajustes Profundos (Sitio)
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Finalmente, está "Config. Sitio". Esta es una pantalla especial.
          </p>
        </div>

        <p className="text-neutral-600 dark:text-neutral-400">
          Aquí vas a meter cosas súper importantes como <strong>Tus enlaces a Instagram, el texto de las políticas de reembolso y habilitar los emails</strong>. Tómate el tiempo de rellenar todo. Si alguna vez quieres cambiar el "Mensaje de Bienvenida", este es el lugar. No cambies cosas si no estás seguro de su de qué trata el campo.
        </p>
      </div>
    )
  }
];

export default function AdminManualPage() {
  const [activeTab, setActiveTab] = React.useState(MANUAL_SECTIONS[0].id);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const savedState = localStorage.getItem("manual-sidebar-collapsed");
    if (savedState) setIsCollapsed(savedState === "true");
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("manual-sidebar-collapsed", String(newState));
  };

  return (
    <div className="p-6 md:p-8 mx-[6px] min-h-screen">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center border border-blue-200 dark:border-blue-800">
          <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Manual de Usuario</h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400">La guía definitiva "para todos" paso a paso.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden glassmorphism">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          
          {/* Sidebar / TabsList Sidebar Hybrid */}
          <div className={cn(
            "relative border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-4 transition-all duration-300 ease-in-out shrink-0",
            isCollapsed ? "lg:w-20 lg:p-2" : "lg:w-1/3"
          )}>

            {/* Toggle Button */}
            <button 
              onClick={toggleSidebar}
              className="hidden lg:flex absolute -right-3 top-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1 shadow-sm text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 z-50 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <h3 className={cn(
              "font-bold text-neutral-800 dark:text-neutral-200 mb-4 px-2 uppercase tracking-wide text-xs",
              isCollapsed && "hidden lg:block lg:text-center lg:px-0"
            )}>
              {isCollapsed ? "Casos" : "Casos de Uso"}
            </h3>

            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 custom-scrollbar">
              {MANUAL_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  title={isCollapsed ? section.title : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg transition-all text-left whitespace-nowrap shrink-0",
                    isCollapsed ? "px-3 py-3 lg:justify-center justify-start lg:whitespace-normal" : "px-4 py-3 lg:whitespace-normal",
                    activeTab === section.id
                      ? "bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200/60 dark:border-neutral-700 font-bold text-blue-600 dark:text-blue-400"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 border border-transparent font-medium"
                  )}
                >
                  <section.icon className={cn("w-5 h-5 shrink-0", activeTab === section.id ? "text-blue-600 dark:text-blue-400" : "text-neutral-400")} />
                  <span className={cn("text-sm truncate", isCollapsed && "lg:hidden")}>{section.title}</span>
                </button>
              ))}
            </div>
            
            <div className={cn("mt-8 p-4 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20", isCollapsed && "lg:hidden")}>
              <div className="flex items-center gap-2 mb-2 font-bold">
                <HelpCircle className="w-5 h-5" />
                ¿Necesitas soporte técnico?
              </div>
              <p className="text-sm text-blue-100">Si un paso falla y la pantalla arroja un texto rojo ("Error de Servidor"), contacta a los desarrolladores con una captura de pantalla.</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 md:p-8 lg:p-10 bg-white dark:bg-neutral-900 transition-all duration-300">
            {MANUAL_SECTIONS.map((section) => (
              <div key={section.id} className={activeTab === section.id ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>
                {section.content}
              </div>
            ))}
          </div>
          
        </div>
      </Card>
      
    </div>
  );
}
