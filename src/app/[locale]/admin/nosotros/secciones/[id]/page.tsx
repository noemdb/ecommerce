import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FieldsEditor } from "@/components/nosotros/FieldsEditor";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, Globe, GlobeLock } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SectionDetailPage({ params }: Props) {
  const session = await auth();
  if (!session || (session.user as any).role === "CUSTOMER") {
    redirect("/admin/login");
  }

  const { id } = await params;

  const section = await prisma.profileSection.findUnique({
    where: { id },
    include: { fields: { orderBy: { order: "asc" } } },
  });

  if (!section) notFound();

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/nosotros/secciones"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a secciones
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{section.title}</h1>
            {section.subtitle && (
              <p className="text-neutral-500 dark:text-neutral-400 mt-1">{section.subtitle}</p>
            )}
            <p className="font-mono text-xs text-neutral-400 mt-2">slug: {section.slug}</p>
          </div>

          {/* Estado visual */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shrink-0 ${
            section.isPublished
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
          }`}>
            {section.isPublished
              ? <><Globe className="w-3.5 h-3.5" /> Publicada</>
              : <><GlobeLock className="w-3.5 h-3.5" /> Borrador</>}
          </div>
        </div>
      </div>

      {/* Editor de campos */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900 dark:text-white">
            Campos <span className="text-neutral-400 font-normal">({section.fields.length})</span>
          </h2>
        </div>
        <FieldsEditor sectionId={section.id} initialFields={section.fields} />
      </div>
    </div>
  );
}
