export const metadata = {
  title: "Políticas de Cookies | Ecommerce Premium",
  description: "Política sobre el uso de cookies y almacenamiento de datos.",
};

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Protección de Datos y Cookies</h1>
      <p className="text-neutral-500 mb-10">Transparencia respecto a los identificadores digitales que almacenamos en tu navegador.</p>
      
      <div className="prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400 space-y-6">
        <p>Nuestra plataforma, así como muchos ecosistemas de vanguardia en internet, emplea "cookies" pasivas u activas con la meta de proporcionar la experiencia en la web de usuario mas optima y proactiva.</p>
        
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">¿Qué es una Cookie?</h2>
        <p>Una 'Cookie' es una compilación inofensiva de texto estático que se envía con directivas lógicas de un sitio enrutador para anclarse en tu navegador de lectura por periodos limitados. Estos asisten intrínsecamente para registrar carritos de compras inconclusos (sin perder lo agregado), así como sostener recordatorios vitales.</p>

        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">Tipos de identificadores empleados</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Cookies Esenciales:</strong> Mandatorias absolutas para iniciar una sesión transaccional Auth.js en el sistema, previendo vulnerabilidades cibernéticas del tipo CSRF.</li>
          <li><strong>Cookies Analíticas:</strong> Identificadores estadísticos (como los provistos internamente o vía el tag de Google Analytics configurado en el Admin dashboard) referidos al monitoreo general anónimo para optimizar las estructuras de tienda.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">Desactivación Manual</h2>
        <p>Mediante cualquier menú interno de privacidad en los navegadores contemporáneos (ej, Chrome, Safari, Firefox), es perfectamente viable vetar a conveniencia o clausurar permanente cualquiera de los historiales de la sesión.</p>
      </div>
    </div>
  );
}
