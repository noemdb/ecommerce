"use client";

import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import type { SectionWithFields } from "@/lib/nosotros/get-nosotros";
import {
  toggleSectionPublishedAction,
  toggleSectionVisibleAction,
  updateSectionOrderAction,
  deleteSectionAction,
} from "@/actions/nosotros";
import { Button } from "@/components/ui/button";
import {
  Eye, EyeOff, Globe, GlobeLock, Pencil, Trash2, ArrowUp, ArrowDown, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  sections: SectionWithFields[];
}

export function SectionsList({ sections: initial }: Props) {
  const [sections, setSections] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function withLoading(id: string, fn: () => Promise<void>) {
    setLoadingId(id);
    startTransition(async () => {
      await fn();
      setLoadingId(null);
    });
  }

  function move(id: string, direction: "up" | "down") {
    const idx = sections.findIndex((s) => s.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sections.length - 1) return;

    const newSections = [...sections];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]];

    // Reasignar order según posición
    const withOrder = newSections.map((s, i) => ({ ...s, order: i }));
    setSections(withOrder);

    withLoading(id, async () => {
      await updateSectionOrderAction(withOrder.map((s) => ({ id: s.id, order: s.order })));
    });
  }

  async function handleTogglePublished(id: string, current: boolean) {
    withLoading(id, async () => {
      await toggleSectionPublishedAction(id, !current);
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isPublished: !current } : s))
      );
    });
  }

  async function handleToggleVisible(id: string, current: boolean) {
    withLoading(id, async () => {
      await toggleSectionVisibleAction(id, !current);
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isVisible: !current } : s))
      );
    });
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`¿Eliminar la sección "${title}"? Esta acción eliminará también todos sus campos.`)) return;
    withLoading(id, async () => {
      await deleteSectionAction(id);
      setSections((prev) => prev.filter((s) => s.id !== id));
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {sections.map((section, idx) => (
        <div
          key={section.id}
          className={cn(
            "flex items-center gap-3 p-4 rounded-xl border bg-white dark:bg-neutral-900 shadow-sm transition-all",
            !section.isPublished && "opacity-60",
            "border-neutral-200 dark:border-neutral-800"
          )}
        >
          {/* Orden */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => move(section.id, "up")}
              disabled={idx === 0 || isPending}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              title="Subir"
            >
              <ArrowUp className="w-3.5 h-3.5 text-neutral-500" />
            </button>
            <button
              onClick={() => move(section.id, "down")}
              disabled={idx === sections.length - 1 || isPending}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              title="Bajar"
            >
              <ArrowDown className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          </div>

          {/* Order badge */}
          <span className="text-xs font-mono text-neutral-400 w-5 text-center">{idx + 1}</span>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-neutral-900 dark:text-white truncate">{section.title}</p>
            <p className="text-xs text-neutral-400 truncate">
              {section.slug} · {section.fields.length} campos
            </p>
          </div>

          {/* Estado badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              section.isPublished
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
            )}>
              {section.isPublished ? "Publicada" : "Borrador"}
            </span>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-1 shrink-0">
            {loadingId === section.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
            ) : (
              <>
                {/* Toggle visible */}
                <button
                  onClick={() => handleToggleVisible(section.id, section.isVisible)}
                  title={section.isVisible ? "Ocultar" : "Mostrar"}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {section.isVisible
                    ? <Eye className="w-4 h-4 text-neutral-500" />
                    : <EyeOff className="w-4 h-4 text-neutral-400" />}
                </button>
                {/* Toggle published */}
                <button
                  onClick={() => handleTogglePublished(section.id, section.isPublished)}
                  title={section.isPublished ? "Despublicar" : "Publicar"}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {section.isPublished
                    ? <Globe className="w-4 h-4 text-emerald-500" />
                    : <GlobeLock className="w-4 h-4 text-neutral-400" />}
                </button>
                {/* Editar campos */}
                <Link
                  href={`/admin/nosotros/secciones/${section.id}`}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Editar campos"
                >
                  <Pencil className="w-4 h-4 text-blue-500" />
                </Link>
                {/* Eliminar */}
                <button
                  onClick={() => handleDelete(section.id, section.title)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Eliminar sección"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {sections.length === 0 && (
        <p className="text-center py-12 text-neutral-400 text-sm">
          No hay secciones aún. Crea la primera.
        </p>
      )}
    </div>
  );
}
