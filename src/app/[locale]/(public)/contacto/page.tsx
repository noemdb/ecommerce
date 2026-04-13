import { Mail, MapPin, Phone } from "lucide-react";

export const metadata = {
  title: "Contáctanos | Ecommerce Premium",
  description: "Comunícate con nuestro soporte técnico para resolver cualquier inquietud.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Contáctanos</h1>
      <p className="text-neutral-500 mb-12">Estamos aquí para ayudarte. Déjanos tus comentarios o ponte en contacto directo.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold">Nuestras Oficinas</h2>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Dirección Principal</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">Av. Central, Edificio Empresarial Piso 4.<br />Zona Centro, Código Postal 1010.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Teléfono Comercial</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">+00 1234 567890<br />Lunes a Viernes, 8am a 5pm.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Correo Electrónico</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">soporte@ecommercepremium.com</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Envíanos un mensaje</h2>
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Nombre completo</label>
              <input type="text" className="w-full px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Juan Pérez" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Correo electrónico</label>
              <input type="email" className="w-full px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="juan@ejemplo.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Asunto</label>
              <textarea rows={4} className="w-full px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="¿En qué podemos ayudarte?"></textarea>
            </div>
            <button type="button" className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors text-sm">
              Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
