// src/app/admin/site-config/page.tsx
import { requirePermission } from "@/lib/rbac";
import { getSiteConfig } from "@/lib/site-config/get-site-config";
import { SiteConfigForm } from "./site-config-form";
import { Settings } from "lucide-react";

export const metadata = {
  title: "Configuración del Sitio | Admin",
};

export default async function SiteConfigPage() {
  // Only ADMIN can access this page — redirects to /admin otherwise
  await requirePermission("settings:write");

  const config = await getSiteConfig();

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-500/10 rounded-md flex items-center justify-center">
          <Settings className="w-6 h-6 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración del Sitio</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
            Controla nombre, metadata, colores y secciones visibles del homepage.
          </p>
        </div>
      </div>

      <SiteConfigForm initialData={config} />
    </div>
  );
}
