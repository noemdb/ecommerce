"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateLessonSchema, UpdateLessonSchema, type CreateLessonInput, type UpdateLessonInput } from "@/lib/lms/schemas/lms.schemas";
import { createLesson, updateLesson } from "@/actions/lms/course.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LessonEditorProps {
  moduleId: string;
  nextPosition?: number;
  lesson?: any;
}

export function LessonEditor({ moduleId, nextPosition, lesson }: LessonEditorProps) {
  const router = useRouter();
  const isEditing = !!lesson;

  const form = useForm<CreateLessonInput | UpdateLessonInput>({
    resolver: zodResolver(isEditing ? UpdateLessonSchema : CreateLessonSchema),
    defaultValues: isEditing ? {
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      slug: lesson.slug,
      content: lesson.content || "",
      position: lesson.position,
      isPublished: lesson.isPublished,
      isPreview: lesson.isPreview,
    } : {
      moduleId,
      title: "",
      slug: "",
      content: "",
      position: nextPosition || 0,
      isPublished: true,
      isPreview: false,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const result = isEditing 
        ? await updateLesson(data)
        : await createLesson(data);

      if (!result.ok) {
        toast.error(result.error || `Error al ${isEditing ? "actualizar" : "crear"} la lección`);
        return;
      }

      toast.success(`Lección ${isEditing ? "actualizada" : "creada"} correctamente`);
      if (!isEditing) form.reset();
      router.refresh();
    } catch (error) {
      toast.error("Error interno");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {!isEditing && (
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Nueva Lección</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Añade una nueva lección al final de este módulo.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`lesson-title-${lesson?.id || "new"}`}>Título</Label>
          <Input id={`lesson-title-${lesson?.id || "new"}`} {...form.register("title")} placeholder="Ej. Introducción" />
          {form.formState.errors.title && <span className="text-xs text-red-500 font-medium">{form.formState.errors.title.message}</span>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`lesson-slug-${lesson?.id || "new"}`}>Slug</Label>
          <Input id={`lesson-slug-${lesson?.id || "new"}`} {...form.register("slug")} placeholder="ej-introduccion" />
          {form.formState.errors.slug && <span className="text-xs text-red-500 font-medium">{form.formState.errors.slug.message}</span>}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`lesson-content-${lesson?.id || "new"}`}>Contenido (Opcional)</Label>
        <Textarea 
          id={`lesson-content-${lesson?.id || "new"}`} 
          {...form.register("content")} 
          className="font-mono text-sm min-h-[100px]"
          placeholder="Escribe aquí el contenido en texto de la lección..." 
        />
      </div>

      <div className="flex flex-col gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-md border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            id={`lesson-pub-${lesson?.id || "new"}`}
            {...form.register("isPublished")}
            className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-neutral-900 dark:focus:ring-white cursor-pointer accent-neutral-900 dark:accent-white transition-all"
          />
          <Label htmlFor={`lesson-pub-${lesson?.id || "new"}`} className="font-semibold cursor-pointer text-sm">Lección Publicada</Label>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            id={`lesson-prev-${lesson?.id || "new"}`}
            {...form.register("isPreview")}
            className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-neutral-900 dark:focus:ring-white cursor-pointer accent-neutral-900 dark:accent-white transition-all"
          />
          <Label htmlFor={`lesson-prev-${lesson?.id || "new"}`} className="font-semibold cursor-pointer text-sm">Vista previa gratuita (para alumnos no inscritos)</Label>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={form.formState.isSubmitting} className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
          {form.formState.isSubmitting ? "Guardando..." : isEditing ? "Actualizar Lección" : "Crear Lección"}
        </Button>
      </div>
    </form>
  );
}
