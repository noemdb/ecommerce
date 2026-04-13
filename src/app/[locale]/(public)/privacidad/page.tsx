export const metadata = {
  title: "Política de Privacidad | Ecommerce Premium",
  description: "Conoce cómo recopilamos, usamos y protegemos tus datos personales.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Política de Privacidad</h1>
      <p className="text-neutral-500 mb-10">Última actualización: Noviembre 2024</p>
      
      <div className="prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400 space-y-6">
        <p>Tu privacidad es críticamente importante para nosotros. En Ecommerce Premium, tenemos algunos principios fundamentales éticos en cuanto a información privada se confiere.</p>
        
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">Recopilación de la Información</h2>
        <p>Recopilamos información personalmente identificable, tal como su dirección de correo electrónico, nombre, domicilio de entrega o facturación y números de teléfono, con el expreso propósito de cumplir operativamente con el despacho de órdenes.</p>
        
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">Resguardo y Uso de la Información</h2>
        <p>No vendemos, rentamos, ni damos facilidades de intercambio de listas de clientes a ninguna entidad ajena (terceros). Su confidencialidad se utiliza internamente con proposiciones analíticas, logística de entrega, y para enviar notificaciones críticas relacionadas a la cuenta.</p>

        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">Pagos y Transacciones</h2>
        <p>No retenemos de forma deliberada el mapeo de sus tarjetas de débito o crédito en nuestros sistemas de base de datos directamente, operamos con puertas de enlace encriptadas internacionales con las regulaciones más altas PSI-DSS.</p>
      </div>
    </div>
  );
}
