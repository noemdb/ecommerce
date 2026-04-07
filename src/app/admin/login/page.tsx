import { StaffLoginForm } from "@/components/auth/StaffLoginForm";
import { AuthCard } from "@/components/auth/AuthCard";
import { ShieldAlert } from "lucide-react";
import { Suspense } from "react";

export const metadata = {
  title: "Admin Login | Ecommerce Premium",
  description: "Panel de administración restringido.",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-neutral-900 relative overflow-hidden">
      {/* Decorative Background for Admin */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 w-full max-w-md">
        <AuthCard 
          title="Admin Dashboard" 
          subtitle="Identifícate para gestionar tu plataforma"
          icon={<ShieldAlert className="w-8 h-8 text-neutral-100" />}
          className="bg-neutral-950/40 border-neutral-800 backdrop-blur-xl"
        >
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-neutral-400">Preparando acceso seguro...</div>}>
            <StaffLoginForm />
          </Suspense>
        </AuthCard>
        
        <p className="mt-8 text-center text-sm text-neutral-500">
          ¿Problemas de acceso? Contacta al soporte técnico institucional.
        </p>
      </div>
    </div>
  );
}
