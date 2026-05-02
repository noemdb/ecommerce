"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Circle, PlayCircle, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CourseWithModules } from "@/types/lms";
import { useState } from "react";

interface CourseSidebarProps {
  course: CourseWithModules;
  courseSlug: string;
}

export function CourseSidebar({ course, courseSlug }: CourseSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  // El módulo inicial a abrir
  const defaultModules = course.modules.map(m => m.id);

  return (
    <div 
      className={cn(
        "h-full border-r bg-white dark:bg-neutral-950 flex-shrink-0 transition-all duration-300 relative group flex flex-col shadow-sm z-20",
        isCollapsed ? "w-0 md:w-20" : "w-full md:w-[340px]"
      )}
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="absolute -right-4 top-6 hidden md:flex items-center justify-center w-8 h-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full shadow-sm text-neutral-500 hover:text-blue-600 transition-colors z-50"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4"/> : <ChevronLeft className="w-4 h-4"/>}
      </button>

      <div className={cn("p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3 shrink-0 h-[76px] transition-all overflow-hidden", isCollapsed && "md:px-3 md:justify-center")}>
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className={cn("min-w-0 flex-1 transition-opacity duration-200", isCollapsed ? "opacity-0 hidden" : "opacity-100")}>
          <h2 className="font-bold text-sm text-neutral-900 dark:text-white truncate">{course.title}</h2>
          <p className="text-xs text-neutral-500 truncate mt-0.5">Contenido del curso</p>
        </div>
      </div>

      <div className={cn("flex-1 overflow-x-hidden", isCollapsed && "md:hidden")}>
        <Accordion type="multiple" defaultValue={defaultModules} className="w-full">
          {course.modules.map((module) => (
            <AccordionItem value={module.id} key={module.id} className="border-b border-neutral-100 dark:border-neutral-800/50 last:border-0">
              <AccordionTrigger className="px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors [&[data-state=open]>div>svg]:rotate-180 hover:no-underline">
                <div className="flex items-start text-left gap-3 w-full pr-2">
                  <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400">{module.position}</span>
                  </div>
                  <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 flex-1">{module.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3 pt-0 px-3">
                <ul className="flex flex-col space-y-1">
                  {module.lessons.map((lesson) => {
                    const href = `/cuenta/cursos/${courseSlug}/${lesson.slug}`;
                    const isActive = pathname === href;
                    // Si no hay un array progress o está vacío, asumimos false
                    const isCompleted = lesson.progress?.[0]?.completed ?? false;

                    return (
                      <li key={lesson.id}>
                        <Link
                          href={href}
                          className={cn(
                            "flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative",
                            isActive 
                              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium" 
                              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:text-neutral-900 dark:hover:text-neutral-200"
                          )}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 dark:bg-blue-500 rounded-r-full" />
                          )}
                          <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className={cn("h-4 w-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-emerald-500")} />
                            ) : isActive ? (
                              <PlayCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <Circle className="h-4 w-4 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-400" />
                            )}
                          </div>
                          <span className="line-clamp-2 flex-1 leading-snug">{lesson.title}</span>
                          {lesson.durationSec && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 shrink-0 mt-0.5">
                              {Math.round(lesson.durationSec / 60)}m
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Visualización colapsada para desktop */}
      {isCollapsed && (
        <div className="hidden md:flex flex-col items-center py-4 gap-4 flex-1">
          {course.modules.map((module) => (
            <div key={module.id} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors" title={module.title}>
              <span className="text-xs font-bold">{module.position}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
