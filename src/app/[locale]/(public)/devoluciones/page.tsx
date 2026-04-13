export const metadata = {
  title: "Políticas de Devolución | Ecommerce Premium",
  description: "Conoce paso a paso cómo tramitar un reembolso o reemplazo de producto.",
};

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Políticas de Devolución</h1>
      <p className="text-neutral-500 mb-10">Nuestra garantía de satisfacción para cuidar de tu inversión.</p>
      
      <div className="prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400 space-y-6">
        <p>Nuestra política aplica durante los <strong className="text-neutral-900 dark:text-white">15 días</strong> posteriores a su compra real. Una vez excedida dicha fecha cronológica no podremos admitir un reemplazo primario ni reembolso sustancial.</p>
        
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">Criterios de Elegibilidad</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Su artículo debe poseer un justificativo por daño de fábrica o daño estructural causado durante el envío logístico nativo.</li>
          <li>El artículo se debe encontrar sin haber sido estrenado (uso indebido) y bajo condiciones íntegras conservando su etiqueta y empaque inicial.</li>
          <li>Se solicitará copia de la factura de confirmación recibida por correo u orden verificable en el Dashboard.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">Reembolsos</h2>
        <p>Tras analizar favorablemente la pieza defectuosa dentro de las inmediaciones físicas de la tienda (o vía correspondencia a nuestro buzón central), enviaremos un memorando aprobatorio dictaminado por los analistas. En este caso el reembolso será efectuado de manera autómatica hacia el originador y canal de cobro que el usuario proveyó (Ej. Cuenta Bancaria o Zelle) unificándose los procesamientos a nivel contable (usualmente requiere 3 días bancarios).</p>
      </div>
    </div>
  );
}
