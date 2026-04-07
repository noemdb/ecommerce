import { CustomerLoginForm } from "@/components/auth/CustomerLoginForm";
import { AuthCard } from "@/components/auth/AuthCard";
import { LogIn } from "lucide-react";
import { Suspense } from "react";

export const metadata = {
  title: "Acceder a mi Cuenta | Ecommerce Premium",
  description: "Inicia sesión para acceder a tu historial de pedidos premium y beneficios exclusivos.",
};

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 bg-neutral-50/50 dark:bg-neutral-950/50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />

      <AuthCard 
        title="Mi Cuenta" 
        subtitle="Inicia sesión para continuar tu experiencia premium"
        icon={<LogIn className="w-8 h-8" />}
      >
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Cargando...</div>}>
          <CustomerLoginForm />
        </Suspense>
      </AuthCard>
    </div>
  );
}
