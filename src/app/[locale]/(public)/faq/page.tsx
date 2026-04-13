export const metadata = {
  title: "Preguntas Frecuentes | Ecommerce Premium",
  description: "Encuentra respuestas a las dudas más comunes sobre compras, envíos y pagos.",
};

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Preguntas Frecuentes</h1>
      <p className="text-neutral-500 mb-12">Todo lo que necesitas saber sobre nuestros servicios y productos.</p>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2">¿Cuáles son los métodos de pago aceptados?</h3>
          <p className="text-neutral-600 dark:text-neutral-400">Aceptamos transferencias bancarias, pago móvil, Zelle y criptomonedas.</p>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2">¿Hacen envíos a todo el país?</h3>
          <p className="text-neutral-600 dark:text-neutral-400">Sí, realizamos envíos seguros y garantizados a todo el territorio nacional mediante nuestros aliados logísticos.</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2">¿Cómo puedo rastrear mi pedido?</h3>
          <p className="text-neutral-600 dark:text-neutral-400">Una vez confirmada tu orden, entrando a tu Cuenta en la sección de 'Mis Pedidos' podrás ver el número de guía exacto para su seguimiento en tiempo real.</p>
        </div>
      </div>
    </div>
  );
}
