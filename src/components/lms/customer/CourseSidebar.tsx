"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CourseWithModules } from "@/types/lms";

interface CourseSidebarProps {
  course: CourseWithModules;
  courseSlug: string;
}

export function CourseSidebar({ course, courseSlug }: CourseSidebarProps) {
  const pathname = usePathname();
  // El módulo inicial a abrir
  const defaultModules = course.modules.map(m => m.id);

  return (
    <div className="h-full border-r bg-muted/20 w-full md:w-[300px] flex-shrink-0">
      <div className="p-4 border-b">
        <h2 className="font-semibold">{course.title}</h2>
      </div>
      <Accordion type="multiple" defaultValue={defaultModules} className="w-full">
        {course.modules.map((module) => (
          <AccordionItem value={module.id} key={module.id} className="border-b-0">
            <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 text-sm font-medium">
              {module.title}
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <ul className="flex flex-col">
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
                          "flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                          isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0" />
                        )}
                        <span className="line-clamp-2 flex-1">{lesson.title}</span>
                        {lesson.durationSec && (
                          <span className="text-xs shrink-0">
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
  );
}
