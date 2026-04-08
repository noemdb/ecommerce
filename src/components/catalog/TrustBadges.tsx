import { Lock, FileCheck, MessageCircle, ShieldCheck } from "lucide-react";

export function TrustBadges() {
  const badges = [
    {
      icon: Lock,
      title: "Pago seguro",
      description: "Transferencia bancaria protegida",
    },
    {
      icon: FileCheck,
      title: "Verificación manual",
      description: "Validamos cada comprobante",
    },
    {
      icon: MessageCircle,
      title: "Soporte por WhatsApp",
      description: "Atención personalizada inmediata",
    },
    {
      icon: ShieldCheck,
      title: "Productos garantizados",
      description: "Calidad premium asegurada",
    },
  ];

  return (
    <section className="py-12 md:py-24 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-md bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                <badge.icon className="w-8 h-8 text-blue-600 dark:text-blue-500" />
              </div>
              <h3 className="text-lg font-bold mb-2 tracking-tight">{badge.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[200px] leading-relaxed">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
