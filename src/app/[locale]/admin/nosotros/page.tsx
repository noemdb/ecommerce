import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBusinessProfile } from "@/lib/nosotros/get-nosotros";
import { BusinessProfileForm } from "@/components/nosotros/BusinessProfileForm";
import { Link } from "@/i18n/navigation";
import { LayoutList } from "lucide-react";

export default async function AdminNosotrosPage() {
  const session = await auth();
  if (!session || (session.user as any).role === "CUSTOMER") {
    redirect("/login");
  }

  const profile = await getBusinessProfile();

  return (
    <div className="flex flex-col gap-8 p-8 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Perfil — Página Nosotros</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Configura la información base de tu perfil público en{" "}
            <span className="font-mono text-blue-600 dark:text-blue-400">/nosotros</span>
          </p>
        </div>
        <Link
          href="/admin/nosotros/secciones"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <LayoutList className="w-4 h-4" />
          Gestionar Secciones
        </Link>
      </div>

      {/* Formulario */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
        <BusinessProfileForm profile={profile} />
      </div>
    </div>
  );
}
