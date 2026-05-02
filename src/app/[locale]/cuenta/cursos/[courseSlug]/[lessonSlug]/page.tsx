import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requireCourseEnrollment } from "@/lib/lms/access-guard";
import { CourseSidebar } from "@/components/lms/customer/CourseSidebar";
import { LessonResourceViewer } from "@/components/lms/customer/LessonResourceViewer";
import { MarkCompleteButton } from "@/components/lms/customer/MarkCompleteButton";
import type { CourseWithModules } from "@/types/lms";
import {
  Clock,
  BookOpen,
  Download,
  FileText,
  GraduationCap,
  Layers,
  ChevronRight,
} from "lucide-react";

export default async function LessonPage(props: {
  params: Promise<{ courseSlug: string; lessonSlug: string; locale: string }>;
}) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.customerId) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { slug: params.courseSlug },
    include: {
      modules: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            include: {
              progress: {
                where: { customerId: session.user.customerId },
              },
              resources: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
    },
  }) as CourseWithModules | null;

  if (!course) notFound();

  try {
    await requireCourseEnrollment(session.user.customerId, course.id);
  } catch {
    redirect(`/cuenta/cursos`);
  }

  // Encontrar la lección actual y su módulo
  let currentLesson = null;
  let currentModule = null;
  let lessonIndex = 0;
  let totalLessons = 0;
  let nextLesson: { slug: string } | null = null;
  let prevLesson: { slug: string } | null = null;

  const allLessons: Array<{ slug: string; moduleTitle: string }> = [];
  for (const module of course.modules) {
    for (const lesson of module.lessons) {
      allLessons.push({ slug: lesson.slug, moduleTitle: module.title });
    }
  }
  totalLessons = allLessons.length;

  for (const module of course.modules) {
    const foundIndex = module.lessons.findIndex(
      (l) => l.slug === params.lessonSlug
    );
    if (foundIndex !== -1) {
      currentLesson = module.lessons[foundIndex];
      currentModule = module;
      const globalIdx = allLessons.findIndex(
        (l) => l.slug === params.lessonSlug
      );
      lessonIndex = globalIdx + 1;
      if (globalIdx > 0) prevLesson = allLessons[globalIdx - 1];
      if (globalIdx < allLessons.length - 1) nextLesson = allLessons[globalIdx + 1];
      break;
    }
  }

  if (!currentLesson || !currentModule) notFound();

  const isCompleted = currentLesson.progress?.[0]?.completed ?? false;
  const durationMin = Math.round((currentLesson.durationSec ?? 0) / 60);

  // Calculate module lesson position
  const moduleLessonIndex =
    currentModule.lessons.findIndex((l) => l.slug === params.lessonSlug) + 1;

  return (
    <div className="flex w-full min-h-full bg-neutral-50 dark:bg-neutral-950 relative">
      {/* Sidebar wrapper */}
      <div className="flex-shrink-0 z-20">
        <CourseSidebar course={course} courseSlug={params.courseSlug} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Top breadcrumb bar */}
        <div className="sticky top-0 z-10 shrink-0 flex items-center gap-2 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-xs font-medium text-neutral-500 dark:text-neutral-400 shadow-sm">
          <GraduationCap className="w-4 h-4 text-blue-500" />
          <span className="truncate max-w-[200px] text-neutral-700 dark:text-neutral-300">
            {course.title}
          </span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Layers className="w-4 h-4 text-violet-500 shrink-0" />
          <span className="truncate max-w-[200px]">{currentModule.title}</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate text-neutral-800 dark:text-neutral-200 font-bold">
            {currentLesson.title}
          </span>
        </div>

        {/* Content Flow */}
        <div className="w-full flex flex-col flex-1 px-4 py-2">
          {/* Hero header */}
          <div className="w-full rounded-lg bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 dark:from-blue-900 dark:via-blue-800 dark:to-violet-900 px-8 py-10 md:py-14 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 w-96 h-24 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />

            <div className="relative max-w-4xl mx-auto space-y-4">
              {/* Pills: module + duration + status */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                  <BookOpen className="w-3.5 h-3.5" />
                  {currentModule.title}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                  <Clock className="w-3.5 h-3.5" />
                  {durationMin > 0 ? `${durationMin} min` : "Lección"}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                  <FileText className="w-3.5 h-3.5" />
                  Lección {moduleLessonIndex} de {currentModule.lessons.length}
                </span>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30 backdrop-blur-sm">
                    ✓ Completada
                  </span>
                )}
              </div>

              {/* Lesson title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {currentLesson.title}
              </h1>

              {/* Module description */}
              {currentModule.description && (
                <p className="text-blue-100 text-base md:text-lg leading-relaxed max-w-2xl opacity-90">
                  {currentModule.description}
                </p>
              )}

              {/* Progress counter */}
              <p className="text-white/50 text-xs font-medium pt-1">
                Lección global {lessonIndex} de {totalLessons} en el curso
              </p>
            </div>
          </div>

          {/* Body content */}
          <div className="w-full mx-auto px-4 md:px-4 lg:px-4 py-4 space-y-2 max-w-none">
            {/* Main lesson content */}
            <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div className="border-b border-neutral-100 dark:border-neutral-800 px-6 py-4 flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <h2 className="font-bold text-sm uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                  Contenido de la Lección
                </h2>
              </div>
              {currentLesson.content ? (
                <div
                  className="prose prose-blue prose-sm md:prose-base dark:prose-invert max-w-none p-6 md:p-8 prose-headings:font-black prose-p:leading-relaxed prose-li:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                />
              ) : (
                <div className="py-16 text-center text-neutral-400 dark:text-neutral-600 px-6">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="italic text-sm">
                    El contenido de esta lección aún se está procesando.
                  </p>
                </div>
              )}
            </section>

            {/* Resources section */}
            <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div className="border-b border-neutral-100 dark:border-neutral-800 px-6 py-4 flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Download className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-sm uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                  Recursos Descargables
                </h2>
                <span className="ml-auto text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-full">
                  {currentLesson.resources.length}
                </span>
              </div>

              {currentLesson.resources.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 dark:text-neutral-600 px-6">
                  <Download className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm italic">
                    No hay recursos adjuntos a esta lección.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {currentLesson.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="px-6 py-5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-200"
                    >
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        {resource.title}
                      </h3>
                      <LessonResourceViewer resourceId={resource.id} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Navigation + Mark complete */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-8">
              {/* Prev / Next navigation */}
              <div className="flex items-center gap-3">
                {prevLesson ? (
                  <a
                    href={`/cuenta/cursos/${params.courseSlug}/${prevLesson.slug}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    ← Anterior
                  </a>
                ) : (
                  <div />
                )}
                {nextLesson && (
                  <a
                    href={`/cuenta/cursos/${params.courseSlug}/${nextLesson.slug}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Siguiente →
                  </a>
                )}
              </div>

              <MarkCompleteButton
                lessonId={currentLesson.id}
                isCompleted={isCompleted}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
