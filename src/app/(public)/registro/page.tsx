import { CustomerRegisterForm } from "@/components/auth/CustomerRegisterForm";
import { AuthCard } from "@/components/auth/AuthCard";
import { UserPlus } from "lucide-react";

export const metadata = {
  title: "Unirse a la Élite | Ecommerce Premium",
  description: "Crea tu cuenta premium para acceder a una experiencia de compra exclusiva y seguimiento de pedidos en tiempo real.",
};

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 bg-neutral-50/50 dark:bg-neutral-950/50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />

      <AuthCard 
        title="Crear Cuenta" 
        subtitle="Únete a nuestra comunidad exclusiva de coleccionistas"
        icon={<UserPlus className="w-8 h-8" />}
      >
        <CustomerRegisterForm />
      </AuthCard>
    </div>
  );
}
