import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllSectionsForAdmin } from "@/lib/nosotros/get-nosotros";
import { SectionsList } from "@/components/nosotros/SectionsList";
import { CreateSectionForm } from "@/components/nosotros/CreateSectionForm";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";

export default async function AdminSeccionesPage() {
  const session = await auth();
  if (!session || (session.user as any).role === "CUSTOMER") {
    redirect("/admin/login");
  }

  const sections = await getAllSectionsForAdmin();

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/nosotros"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al perfil
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Secciones</h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Reordena, publica u oculta secciones. Las publicadas aparecen en{" "}
              <span className="font-mono text-blue-600 dark:text-blue-400">/nosotros</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
              {sections.filter((s) => s.isPublished).length} publicadas
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-full font-medium">
              {sections.length} totales
            </span>
          </div>
        </div>
      </div>

      {/* Formulario de nueva sección */}
      <CreateSectionForm />

      {/* Lista de secciones */}
      <SectionsList sections={sections} />
    </div>
  );
}
