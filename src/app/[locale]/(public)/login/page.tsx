import { CustomerLoginForm } from "@/components/auth/CustomerLoginForm";
import { AuthCard } from "@/components/auth/AuthCard";
import { LogIn } from "lucide-react";
import { Suspense } from "react";

export const metadata = {
  title: "Acceder a mi Cuenta | Ecommerce Premium",
  description: "Inicia sesión para acceder a tu historial de pedidos premium y beneficios exclusivos.",
};

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  const t = (key: string) => messages.Auth[key as keyof typeof messages.Auth];

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 bg-neutral-50/50 dark:bg-neutral-950/50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-lg blur-[120px]" />
      <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-lg blur-[120px]" />

      <AuthCard 
        title={t("login_title")} 
        subtitle={t("login_subtitle")}
        icon={<LogIn className="w-8 h-8" />}
      >
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Cargando...</div>}>
          <CustomerLoginForm />
        </Suspense>
      </AuthCard>
    </div>
  );
}
