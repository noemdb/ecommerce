"use client";

import { Prisma } from "@prisma/client";
import { BookOpen, Clock, PlayCircle, Star, Users, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type CourseWithRelations = Prisma.CourseGetPayload<{
  include: { modules: { include: { lessons: true } } }
}>;

interface CoursePreviewCardProps {
  course: CourseWithRelations;
}

export function CoursePreviewCard({ course }: CoursePreviewCardProps) {
  const totalModules = course.modules.length;
  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Portada simulada */}
      <div className="h-40 bg-gradient-to-br from-blue-600 to-indigo-800 relative flex items-center justify-center p-6 text-center">
        {course.isPublished && (
          <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-[10px] uppercase font-black px-2 py-1 rounded">
            Publicado
          </span>
        )}
        <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md line-clamp-3">
          {course.title || "Título del Curso"}
        </h3>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex gap-2 mb-4">
          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-md">
            LMS
          </span>
          <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 5.0
          </span>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 flex-1">
          {course.shortDescription || "Agrega una descripción corta para que los alumnos sepan de qué trata."}
        </p>

        <div className="grid grid-cols-2 gap-y-3 text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-neutral-400" />
            <span>{totalModules} Módulos</span>
          </div>
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-neutral-400" />
            <span>{totalLessons} Lecciones</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span>A tu ritmo</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-400" />
            <span>Ilimitado</span>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <button className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Info className="w-4 h-4" /> Ver Temario Completo
            </button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[85vh] p-8 md:p-10 overflow-y-auto bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-xl">
            <DialogHeader className="border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-4">
              <DialogTitle className="text-2xl font-black">{course.title}</DialogTitle>
              <DialogDescription className="text-sm mt-2">
                {course.shortDescription || "Sin descripción corta"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-2">Acerca del Curso</h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {course.description || "Sin descripción detallada disponible."}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4">Temario ({totalModules} Módulos)</h4>
                {course.modules.length === 0 ? (
                  <p className="text-sm italic text-neutral-400">Este curso aún no tiene módulos.</p>
                ) : (
                  <Accordion type="multiple" className="space-y-3">
                    {course.modules.map((m, idx) => (
                      <AccordionItem key={m.id} value={m.id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 bg-neutral-50/50 dark:bg-neutral-900/30">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex flex-col items-start text-left">
                            <span className="font-bold text-sm text-neutral-900 dark:text-white">Módulo {idx + 1}: {m.title}</span>
                            <span className="text-xs text-neutral-500 font-normal">{m.lessons.length} lecciones</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          {m.description && <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 italic">{m.description}</p>}
                          {m.lessons.length === 0 ? (
                            <p className="text-xs text-neutral-400 ml-4">Sin lecciones añadidas</p>
                          ) : (
                            <ul className="space-y-2 ml-2 border-l-2 border-neutral-200 dark:border-neutral-800 pl-4">
                              {m.lessons.map(l => (
                                <li key={l.id} className="text-sm flex items-center justify-between group">
                                  <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                                    <PlayCircle className="w-3 h-3 text-neutral-400" />
                                    {l.title}
                                  </span>
                                  {l.durationSec ? (
                                    <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                                      {Math.floor(l.durationSec / 60)}:{String(l.durationSec % 60).padStart(2, '0')}
                                    </span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <p className="text-[10px] text-center text-neutral-400 mt-3 font-mono">
          /{course.slug || "slug-del-curso"}
        </p>
      </div>
    </div>
  );
}
