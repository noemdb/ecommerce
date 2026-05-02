"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateModuleSchema, type UpdateModuleInput } from "@/lib/lms/schemas/lms.schemas";
import { updateModule } from "@/actions/lms/course.actions";
import { deleteLessonResource } from "@/actions/lms/resource.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Settings, ListVideo, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LessonEditor } from "./LessonEditor";
import { ResourceUploader } from "./ResourceUploader";
import { Prisma } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ModuleWithLessons = Prisma.CourseModuleGetPayload<{
  include: { lessons: { include: { resources: true } } }
}>;

interface ModuleWizardProps {
  module: ModuleWithLessons;
}

const STEPS = [
  { id: 0, title: "Detalles del Módulo", icon: Settings },
  { id: 1, title: "Lecciones y Recursos", icon: ListVideo },
];

export function ModuleWizard({ module }: ModuleWizardProps) {
  const [activeStep, setActiveStep] = useState(0);

  const form = useForm<UpdateModuleInput>({
    resolver: zodResolver(UpdateModuleSchema),
    defaultValues: {
      id: module.id,
      title: module.title,
      description: module.description || "",
      isPublished: module.isPublished,
    },
  });

  const onSubmitDetails = async (data: UpdateModuleInput) => {
    try {
      const result = await updateModule(data);
      if (!result.ok) {
        toast.error(result.error || "Error al actualizar módulo");
        return;
      }
      toast.success("Detalles actualizados correctamente");
      setActiveStep(1);
    } catch (error) {
      toast.error("Error interno");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Horizontal Stepper */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 sm:gap-8">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            const isCompleted = activeStep > index;

            return (
              <div key={step.id} className="flex items-center gap-3">
                <button
                  onClick={() => setActiveStep(index)}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold transition-colors",
                    isActive
                      ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                      : isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-neutral-300 text-neutral-400 bg-transparent dark:border-neutral-700"
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </button>
                <div className="hidden sm:flex flex-col text-left">
                  <span
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      isActive ? "text-neutral-900 dark:text-white" : "text-neutral-400"
                    )}
                  >
                    Paso {index + 1}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isActive ? "text-neutral-900 dark:text-white" : "text-neutral-500"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 0: Detalles Básicos */}
      {activeStep === 0 && (
        <form onSubmit={form.handleSubmit(onSubmitDetails)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid gap-2">
            <Label htmlFor={`title-${module.id}`}>Título del Módulo</Label>
            <Input id={`title-${module.id}`} {...form.register("title")} placeholder="Ej. Introducción al curso" />
            <p className="text-xs text-neutral-500">El nombre de esta sección, visible para los alumnos.</p>
            {form.formState.errors.title && <span className="text-sm text-red-500">{form.formState.errors.title.message}</span>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`desc-${module.id}`}>Descripción (Opcional)</Label>
            <Textarea 
              id={`desc-${module.id}`} 
              {...form.register("description")} 
              placeholder="Breve explicación de lo que se verá en este módulo..." 
              className="min-h-[80px]"
            />
            {form.formState.errors.description && <span className="text-sm text-red-500">{form.formState.errors.description.message}</span>}
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 rounded-md p-4 flex items-start gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="mt-0.5">
              <input 
                type="checkbox" 
                id={`published-${module.id}`}
                {...form.register("isPublished")}
                className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-neutral-900 dark:focus:ring-white cursor-pointer accent-neutral-900 dark:accent-white transition-all"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={`published-${module.id}`} className="text-sm font-bold cursor-pointer">Módulo Publicado</label>
              <p className="text-xs text-neutral-500">
                Al activar, este módulo y sus lecciones publicadas serán visibles en el temario.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
              {form.formState.isSubmitting ? "Guardando..." : "Guardar y Continuar"}
            </Button>
          </div>
        </form>
      )}

      {/* Step 1: Lecciones y Recursos */}
      {activeStep === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <Tabs defaultValue={module.lessons.length > 0 ? module.lessons[0].id : "new"} className="w-full">
            <div className="overflow-x-auto pb-2 mb-4 scrollbar-thin">
              <TabsList className="inline-flex w-max min-w-full justify-start h-auto p-1 bg-neutral-100 dark:bg-neutral-800/50">
                {module.lessons.map((lesson, idx) => (
                  <TabsTrigger 
                    key={lesson.id} 
                    value={lesson.id}
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm text-sm py-2 px-4 rounded-md transition-all"
                  >
                    <span className="font-mono text-[10px] opacity-50 mr-2">{idx + 1}.</span>
                    {lesson.title}
                  </TabsTrigger>
                ))}
                <TabsTrigger 
                  value="new"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm text-sm py-2 px-4 rounded-md transition-all ml-2 text-blue-600 dark:text-blue-400 font-medium"
                >
                  + Nueva Lección
                </TabsTrigger>
              </TabsList>
            </div>

            {module.lessons.map(lesson => (
              <TabsContent key={lesson.id} value={lesson.id} className="mt-0 outline-none">
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-md p-6 bg-white dark:bg-neutral-900/50 space-y-6 shadow-sm">
                  <div className="flex justify-between items-start border-b border-neutral-200 dark:border-neutral-800 pb-4">
                    <div>
                      <h4 className="font-bold text-lg text-neutral-900 dark:text-white">{lesson.title}</h4>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs text-neutral-500 font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700">
                          {lesson.slug}
                        </span>
                        <span className={cn(
                          "text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md flex items-center",
                          lesson.isPublished ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800/30" : "text-neutral-500 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                        )}>
                          {lesson.isPublished ? "Publicado" : "Borrador"}
                        </span>
                        {lesson.isPreview && (
                          <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md flex items-center text-blue-600 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800/30">
                            Vista Previa
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h5 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Settings className="h-4 w-4 text-neutral-400" />
                        Configuración de la Lección
                      </h5>
                      <LessonEditor moduleId={module.id} lesson={lesson} />
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <ListVideo className="h-4 w-4 text-neutral-400" />
                        Recursos de la Lección
                      </h5>
                    
                    {lesson.resources.length === 0 ? (
                      <div className="bg-neutral-50 dark:bg-neutral-800/30 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-md p-6 text-center">
                        <p className="text-sm text-neutral-500">No hay recursos adjuntos para esta lección.</p>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {lesson.resources.map(resource => (
                          <li key={resource.id} className="flex justify-between items-center text-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 rounded-md shadow-sm group">
                            <span className="flex items-center gap-3">
                              <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded">
                                {resource.fileType}
                              </span>
                              <span className="font-medium text-neutral-700 dark:text-neutral-300">{resource.title}</span>
                            </span>
                            <form action={async () => {
                              await deleteLessonResource(resource.id);
                              toast.success("Recurso eliminado");
                            }}>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 rounded-md">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="pt-2">
                      <ResourceUploader lessonId={lesson.id} nextSortOrder={lesson.resources.length} />
                    </div>
                  </div>
                </div>
              </div>
              </TabsContent>
            ))}

            <TabsContent value="new" className="mt-0 outline-none">
              <div className="border border-blue-100 dark:border-blue-900/30 rounded-md bg-blue-50/30 dark:bg-blue-900/10 p-1">
                <LessonEditor moduleId={module.id} nextPosition={module.lessons.length} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-xs text-neutral-500">
              * Las lecciones y recursos se guardan automáticamente al crearlos o eliminarlos.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setActiveStep(0)}>
                Volver a Detalles
              </Button>
              <Button onClick={() => toast.success("Módulo configurado exitosamente")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Finalizar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
