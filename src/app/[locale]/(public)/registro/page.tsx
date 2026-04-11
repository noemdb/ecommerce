import { CustomerRegisterForm } from "@/components/auth/CustomerRegisterForm";
import { AuthCard } from "@/components/auth/AuthCard";
import { UserPlus } from "lucide-react";

export const metadata = {
  title: "Unirse a la Élite | Ecommerce Premium",
  description: "Crea tu cuenta premium para acceder a una experiencia de compra exclusiva y seguimiento de pedidos en tiempo real.",
};

export default async function RegisterPage({
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
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-lg blur-[120px]" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-lg blur-[120px]" />

      <AuthCard 
        title={t("register_title")} 
        subtitle={t("register_subtitle")}
        icon={<UserPlus className="w-8 h-8" />}
      >
        <CustomerRegisterForm />
      </AuthCard>
    </div>
  );
}
