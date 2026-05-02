"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateCourseSchema, type CreateCourseInput } from "@/lib/lms/schemas/lms.schemas";
import { createCourse } from "@/actions/lms/course.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, BookOpen, PenTool, CheckCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Identidad", icon: BookOpen },
  { id: 2, title: "Contenido", icon: PenTool },
  { id: 3, title: "Publicación", icon: CheckCircle },
];

export function CourseWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<CreateCourseInput>({
    resolver: zodResolver(CreateCourseSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      shortDescription: "",
      isPublished: false,
    },
    mode: "onTouched",
  });

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ["title", "slug"];
    if (currentStep === 2) fieldsToValidate = ["shortDescription", "description"];

    const isStepValid = await form.trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: CreateCourseInput) => {
    try {
      const result = await createCourse(data);

      if (!result.ok) {
        toast.error(result.error || "Error al crear el curso");
        return;
      }

      toast.success("Curso creado exitosamente. Ya puedes agregar módulos.");
      if ("data" in result && result.data?.id) {
        router.push(`/admin/lms/courses/${result.data.id}`);
      }
    } catch (error) {
      toast.error("Error interno al procesar la solicitud");
    }
  };

  // Autogenerar slug basado en el título mientras no se haya editado manualmente
  const titleValue = form.watch("title");
  
  useEffect(() => {
    if (!form.getFieldState("slug").isDirty && titleValue) {
      const generatedSlug = titleValue
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9 -]/g, "") // Remove invalid chars
        .trim()
        .replace(/\s+/g, "-") // Collapse whitespace and replace by -
        .replace(/-+/g, "-") // Collapse dashes
        .replace(/^-+|-+$/g, ""); // Trim dashes
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [titleValue, form]);

  return (
    <div className="space-y-8">
      {/* Indicador de Pasos */}
      <div className="flex items-center justify-between relative px-2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full z-0" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-300 z-0 rounded-full" 
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isPast = currentStep > step.id;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-white dark:bg-neutral-900 px-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                isActive ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/20" : 
                isPast ? "border-blue-600 bg-white dark:bg-neutral-900 text-blue-600" : "border-neutral-200 dark:border-neutral-800 text-neutral-400 bg-white dark:bg-neutral-900"
              )}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider",
                isActive || isPast ? "text-neutral-900 dark:text-white" : "text-neutral-400"
              )}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Formulario */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
        
        {/* Paso 1 */}
        <div className={cn("space-y-6 transition-all duration-300", currentStep === 1 ? "block opacity-100" : "hidden opacity-0")}>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg flex gap-3 border border-blue-100 dark:border-blue-800">
            <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>El título es crucial.</strong> Debe ser claro, orientado a la acción y contener palabras clave que los estudiantes usarían para buscar este curso. El "slug" determinará la URL de acceso, intenta que sea corto y legible.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Título del curso</Label>
            <Input 
              id="title" 
              {...form.register("title")} 
              placeholder="Ej. Curso avanzado de Next.js y React" 
              className="text-lg py-6"
            />
            {form.formState.errors.title && (
              <span className="text-sm text-destructive font-medium">{form.formState.errors.title.message}</span>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug">Slug (Identificador URL)</Label>
            <div className="flex items-center">
              <span className="bg-muted text-muted-foreground px-3 py-2 border border-r-0 border-input rounded-l-md text-sm whitespace-nowrap">
                tusitio.com/cursos/
              </span>
              <Input 
                id="slug" 
                {...form.register("slug")} 
                placeholder="ej-curso-avanzado" 
                className="rounded-l-none"
              />
            </div>
            {form.formState.errors.slug && (
              <span className="text-sm text-destructive font-medium">{form.formState.errors.slug.message}</span>
            )}
          </div>
        </div>

        {/* Paso 2 */}
        <div className={cn("space-y-6 transition-all duration-300", currentStep === 2 ? "block opacity-100" : "hidden opacity-0")}>
          <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-lg flex gap-3 border border-amber-100 dark:border-amber-800">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Vende tu curso.</strong> La <em>descripción corta</em> aparecerá en las tarjetas de catálogo (ideal 1-2 líneas). La <em>descripción completa</em> será el argumento principal de venta en la página del curso.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="shortDescription">Descripción Corta (Hook)</Label>
            <Textarea 
              id="shortDescription" 
              {...form.register("shortDescription")} 
              placeholder="Resume el objetivo del curso en una frase llamativa..."
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground text-right">
              {form.watch("shortDescription")?.length || 0} / 255 caracteres
            </p>
            {form.formState.errors.shortDescription && (
              <span className="text-sm text-destructive font-medium">{form.formState.errors.shortDescription.message}</span>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descripción Completa</Label>
            <Textarea 
              id="description" 
              {...form.register("description")} 
              placeholder="Detalla todo lo que los alumnos aprenderán, la metodología, a quién va dirigido..."
              className="min-h-[200px]"
            />
            {form.formState.errors.description && (
              <span className="text-sm text-destructive font-medium">{form.formState.errors.description.message}</span>
            )}
          </div>
        </div>

        {/* Paso 3 */}
        <div className={cn("space-y-6 transition-all duration-300", currentStep === 3 ? "block opacity-100" : "hidden opacity-0")}>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-lg flex gap-3 border border-emerald-100 dark:border-emerald-800">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                ¡Casi listo! El esqueleto del curso está configurado.
              </p>
              <p className="text-sm text-emerald-800/80 dark:text-emerald-400">
                Al guardar, serás dirigido al Editor del Curso donde podrás subir videos, crear módulos y adjuntar recursos (PDFs).
              </p>
            </div>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 flex items-start gap-4 hover:border-blue-500/50 transition-colors bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="mt-1">
              <input 
                type="checkbox" 
                id="isPublished"
                {...form.register("isPublished")}
                className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-neutral-900 dark:focus:ring-white cursor-pointer accent-neutral-900 dark:accent-white transition-all"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="isPublished" className="text-base font-bold cursor-pointer">Publicar Inmediatamente</label>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Recomendamos mantener el curso en <strong>Borrador</strong> hasta que hayas cargado al menos un módulo introductorio. Si lo activas, el curso será visible en el catálogo de inmediato para los estudiantes.
              </p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <Button 
            type="button" 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 1 || form.formState.isSubmitting}
            className="w-32"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Atrás
          </Button>

          {currentStep < STEPS.length ? (
            <Button 
              type="button" 
              onClick={nextStep}
              className="w-32 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
              className="w-48 bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {form.formState.isSubmitting ? "Creando curso..." : "Crear e ir al Editor"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
