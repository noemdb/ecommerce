import type { SectionWithFields } from "@/lib/nosotros/get-nosotros";
import { ProfileFieldRenderer } from "./ProfileFieldRenderer";

interface Props {
  section: SectionWithFields;
}

// Iconos en texto para los slugs conocidos (lucide-react se importa en el layout de ser necesario)
const SECTION_ACCENT: Record<string, string> = {
  introduction: "from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-900",
  "basic-info": "from-slate-500/10 to-gray-500/10 border-slate-200 dark:border-slate-800",
  "academic-formation": "from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-900",
  skills: "from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-900",
  "work-experience": "from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-900",
  certifications: "from-rose-500/10 to-pink-500/10 border-rose-200 dark:border-rose-900",
  languages: "from-cyan-500/10 to-sky-500/10 border-cyan-200 dark:border-cyan-900",
  contact: "from-neutral-500/10 to-zinc-500/10 border-neutral-200 dark:border-neutral-800",
};

export function SectionRenderer({ section }: Props) {
  if (!section.isVisible || !section.isPublished) return null;

  const visibleFields = section.fields.filter((f) => f.isVisible && f.value);

  const accentClasses =
    SECTION_ACCENT[section.slug] ??
    "from-neutral-500/10 to-zinc-500/10 border-neutral-200 dark:border-neutral-800";

  return (
    <section
      id={section.slug}
      className={`rounded-2xl border bg-gradient-to-br ${accentClasses} p-6 md:p-8 flex flex-col gap-6`}
    >
      {/* Header de sección */}
      <div className="flex flex-col gap-1 border-b border-current/10 pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
          {section.title}
        </h2>
        {section.subtitle && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {section.subtitle}
          </p>
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleFields.map((field) => (
          <ProfileFieldRenderer key={field.id} field={field} />
        ))}
      </div>
    </section>
  );
}
