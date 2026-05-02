import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { CourseEditor } from "@/components/lms/admin/CourseEditor";
import { ModuleManager } from "@/components/lms/admin/ModuleManager";
import { LessonEditor } from "@/components/lms/admin/LessonEditor";
import { ResourceUploader } from "@/components/lms/admin/ResourceUploader";
import { Button } from "@/components/ui/button";
import { createModule } from "@/actions/lms/course.actions";
import { deleteLessonResource } from "@/actions/lms/resource.actions";
import { ModuleWizard } from "@/components/lms/admin/ModuleWizard";
import { CoursePreviewCard } from "@/components/lms/admin/CoursePreviewCard";
import { BookOpen, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export default async function EditCoursePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            include: {
              resources: {
                orderBy: { sortOrder: "asc" }
              }
            }
          }
        }
      }
    }
  });

  if (!course) notFound();

  // Acción rápida en server component form para crear módulo
  async function createModuleAction(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    if (!title) return;
    await createModule({
      courseId: course!.id,
      title,
      position: course!.modules.length,
      isPublished: false,
    });
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link 
            href="/admin/lms/courses" 
            className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4 w-fit group"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Volver a Cursos
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Editar Curso</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">{course.title}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Columna Principal: Módulos y Lecciones */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Módulos del Curso</h2>
            
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-6 shadow-sm">
              <ModuleManager courseId={course.id} modules={course.modules} />
              
              <form action={createModuleAction} className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  name="title" 
                  placeholder="Nombre del nuevo módulo..." 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required 
                />
                <Button type="submit" variant="secondary">Añadir Módulo</Button>
              </form>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Contenido y Lecciones</h2>
            {course.modules.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50 text-center gap-3">
                <div className="bg-white dark:bg-neutral-800 p-3 rounded-full shadow-sm">
                  <BookOpen className="h-6 w-6 text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Sin contenido disponible</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto mt-1">
                    Primero debes crear un Módulo en la sección superior para poder añadirle lecciones.
                  </p>
                </div>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {course.modules.map(module => (
                  <AccordionItem value={module.id} key={module.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 shadow-sm">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-bold text-neutral-900 dark:text-white">{module.title}</span>
                        <span className="text-xs text-neutral-500 font-normal mt-0.5">{module.lessons.length} lecciones</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 space-y-6">
                      <ModuleWizard module={module as any} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </section>
        </div>

        {/* Columna Secundaria: Info y Vista Previa */}
        <div className="space-y-6">
          <Tabs defaultValue="settings" className="w-full sticky top-6">
            <TabsList className="w-full grid grid-cols-2 bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-lg mb-4">
              <TabsTrigger value="settings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 rounded-md">
                Ajustes
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 rounded-md">
                Vista Previa
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="mt-0 outline-none">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Ajustes del Curso</h2>
                <CourseEditor course={course} />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0 outline-none">
              <div className="space-y-4">
                <p className="text-xs text-neutral-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-md border border-blue-100 dark:border-blue-900/30">
                  Así es como los alumnos verán la tarjeta principal del curso en el catálogo público.
                </p>
                <CoursePreviewCard course={course as any} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
