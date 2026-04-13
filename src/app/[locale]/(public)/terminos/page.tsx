export const metadata = {
  title: "Términos de Servicio | Ecommerce Premium",
  description: "Condiciones de uso aplicables a todos los usuarios de nuestra plataforma.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Términos de Servicio</h1>
      <p className="text-neutral-500 mb-10">Última actualización: Noviembre 2024</p>
      
      <div className="prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400 space-y-6">
        <p>Bienvenido a Ecommerce Premium. Al acceder o usar nuestro sitio web, usted acepta estar sujeto por estos Términos de Servicio y todas las políticas integradas a este acuerdo. Si usted no está de acuerdo con estos términos, no debe utilizar nuestros servicios.</p>
        
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">1. Uso del Sitio</h2>
        <p>Se le otorga una licencia limitada, no exclusiva e intransferible para acceder al sitio para su uso personal y la realización de compras. No debe modificar, copiar, distribuir, ni explotar comercialmente ningún contenido del sistema.</p>

        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">2. Registro de Cuentas</h2>
        <p>Al crear su cuenta, se compromete a proporcionar información verdadera, precisa y completa. Es el único responsable de la protección y privacidad de sus credenciales de acceso (OTP, contraseñas, correos).</p>

        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">3. Precios y Pagos</h2>
        <p>Todos los precios están sujetos a cambios sin previo aviso. Nos reservamos el derecho a cancelar órdenes si resultara evidente que ha habido un fallo grave o un error en las tipografías de fijación de costos.</p>

        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-8 mb-4">4. Propiedad Intelectual</h2>
        <p>Todo el contenido integrado a este servicio incluyendo logos, gráficos, textos y software operan bajo el resguardo absoluto de leyes de derechos de autor internacionales.</p>
      </div>
    </div>
  );
}
