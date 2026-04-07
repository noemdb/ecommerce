import { requireCustomerSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/cuenta/ProfileForm";
import { ChangePasswordForm } from "@/components/cuenta/ChangePasswordForm";
import { User, ShieldCheck } from "lucide-react";

export default async function PerfilPage() {
  const session = await requireCustomerSession();
  
  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      idDoc: true,
      address: true,
      password: true,
    }
  });

  if (!customer) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Mi Perfil
        </h1>
        <p className="text-neutral-500 mt-2">
          Gestiona tu información personal y seguridad de la cuenta.
        </p>
      </div>

      <div className="space-y-10">
        
        {/* Información Personal */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
            <User className="w-5 h-5 text-neutral-500" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Información Personal</h2>
          </div>
          <div className="p-6">
            <ProfileForm initialData={customer} />
          </div>
        </section>

        {/* Seguridad */}
        {customer.password && (
          <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-neutral-500" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Seguridad</h2>
            </div>
            <div className="p-6">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Cambiar Contraseña</h3>
              <ChangePasswordForm />
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
