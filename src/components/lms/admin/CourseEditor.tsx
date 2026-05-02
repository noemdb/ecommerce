"use client";
// Force cache invalidation

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateCourseSchema, UpdateCourseSchema, type CreateCourseInput, type UpdateCourseInput } from "@/lib/lms/schemas/lms.schemas";
import { createCourse, updateCourse } from "@/actions/lms/course.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Course } from "@prisma/client";

interface CourseEditorProps {
  course?: Course;
}

export function CourseEditor({ course }: CourseEditorProps) {
  const router = useRouter();
  const isEditing = !!course;

  const schema = isEditing ? UpdateCourseSchema : CreateCourseSchema;
  
  const form = useForm<CreateCourseInput | UpdateCourseInput>({
    resolver: zodResolver(schema),
    defaultValues: course ? {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description || "",
      shortDescription: course.shortDescription || "",
      isPublished: course.isPublished,
    } : {
      title: "",
      slug: "",
      description: "",
      shortDescription: "",
      isPublished: false,
    },
  });

  const onSubmit = async (data: CreateCourseInput | UpdateCourseInput) => {
    try {
      const result = isEditing 
        ? await updateCourse(data) 
        : await createCourse(data);

      if (!result.ok) {
        toast.error(result.error || "Error al guardar el curso");
        return;
      }

      toast.success(`Curso ${isEditing ? 'actualizado' : 'creado'} correctamente`);
      if (!isEditing && "data" in result && result.data?.id) {
        router.push(`/admin/lms/courses/${result.data.id}`);
      }
    } catch (error) {
      toast.error("Error interno al procesar la solicitud");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="title">Título del curso</Label>
        <Input id="title" {...form.register("title")} placeholder="Ej. Curso avanzado de Next.js" />
        <p className="text-xs text-muted-foreground">Nombre público del curso visible para los estudiantes.</p>
        {form.formState.errors.title && (
          <span className="text-sm text-destructive">{form.formState.errors.title.message}</span>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input id="slug" {...form.register("slug")} placeholder="ej-curso-avanzado" />
        <p className="text-xs text-muted-foreground">Identificador único para la URL (ej: /cursos/tu-slug).</p>
        {form.formState.errors.slug && (
          <span className="text-sm text-destructive">{form.formState.errors.slug.message}</span>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="shortDescription">Descripción corta</Label>
        <Input id="shortDescription" {...form.register("shortDescription")} placeholder="Breve resumen del curso" />
        <p className="text-xs text-muted-foreground">Frase gancho para las tarjetas de producto (máx 255 carácteres).</p>
        {form.formState.errors.shortDescription && (
          <span className="text-sm text-destructive">{form.formState.errors.shortDescription.message}</span>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descripción completa</Label>
        <Textarea 
          id="description" 
          {...form.register("description")} 
          placeholder="Detalles completos sobre lo que aprenderán..."
          className="min-h-[150px]"
        />
        <p className="text-xs text-muted-foreground">Texto principal de la landing page del curso.</p>
        {form.formState.errors.description && (
          <span className="text-sm text-destructive">{form.formState.errors.description.message}</span>
        )}
      </div>

      <div className="border border-neutral-200 dark:border-neutral-800 rounded-md p-4 flex items-start gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
        <div className="mt-0.5">
          <input 
            type="checkbox" 
            id="isPublished"
            {...form.register("isPublished")}
            className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-neutral-900 dark:focus:ring-white cursor-pointer accent-neutral-900 dark:accent-white transition-all"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="isPublished" className="text-sm font-bold cursor-pointer">Publicado</label>
          <p className="text-xs text-muted-foreground">
            Al activar, el curso será visible en el catálogo. Recomendado: mantener en borrador hasta terminar de subir los módulos.
          </p>
        </div>
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Guardando..." : "Guardar Curso"}
      </Button>
    </form>
  );
}
