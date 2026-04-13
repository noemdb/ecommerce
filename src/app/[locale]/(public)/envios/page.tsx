export const metadata = {
  title: "Envíos y Entregas | Ecommerce Premium",
  description: "Información detallada sobre nuestros tiempos y métodos de envío.",
};

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Envíos y Entregas</h1>
      <p className="text-neutral-500 mb-10">Conoce nuestros tiempos, costos y políticas logísticas.</p>
      
      <div className="prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">Tiempos de Procesamiento</h2>
        <p>Todos los pedidos recibidos antes de las 2:00 PM serán procesados y despachados el mismo día hábil. Los pedidos posteriores a esa hora se procesarán al día siguiente hábil.</p>
        
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">Tiempos de Tránsito Estimado</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Envíos Urbanos / Capital:</strong> 24 a 48 horas hábiles.</li>
          <li><strong>Envíos Nacionales (Regionales):</strong> 3 a 5 días hábiles, dependiendo del agente de carga.</li>
          <li><strong>Recogida en tienda:</strong> Inmediata (tras la confirmación del pago en el portal).</li>
        </ul>

        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">Costos de Envío</h2>
        <p>El costo de envío varía según la dimensión, peso de tu paquete y la zona de entrega, lo cual será calculado automáticamente al momento del Checkout de tu compra antes de realizar cualquier cobro.</p>
      </div>
    </div>
  );
}
