import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requireCourseEnrollment } from "@/lib/lms/access-guard";
import { CourseSidebar } from "@/components/lms/customer/CourseSidebar";
import { CourseProgressBar } from "@/components/lms/customer/CourseProgressBar";
import { CertificateButton } from "@/components/lms/customer/CertificateButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import type { CourseWithModules } from "@/types/lms";

export default async function CourseDetailPage(props: {
  params: Promise<{ courseSlug: string; locale: string }>;
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
              resources: true,
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

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      customerId_courseId: {
        customerId: session.user.customerId,
        courseId: course.id,
      },
    },
  });

  const certificate = await prisma.courseCertificate.findUnique({
    where: {
      customerId_courseId: {
        customerId: session.user.customerId,
        courseId: course.id,
      },
    },
  });

  const firstLesson = course.modules[0]?.lessons[0] || null;

  return (
    <div className="flex flex-col md:flex-row w-full min-h-full bg-neutral-50 dark:bg-neutral-950">
      <div className="flex-shrink-0 z-10">
        <CourseSidebar course={course} courseSlug={params.courseSlug} />
      </div>
      
      <div className="flex-1 p-6 lg:p-10 flex flex-col gap-8 w-full max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {course.description || "Bienvenido al curso. Selecciona una lección en el panel lateral para comenzar."}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm p-8 rounded-2xl space-y-8">
          <CourseProgressBar progress={enrollment?.progress ?? 0} />
          
          {enrollment?.progress === 100 && certificate && (
            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="font-semibold text-lg mb-4">¡Felicidades, has completado el curso!</h3>
              <CertificateButton 
                certificateKey={certificate.certificateKey} 
                verificationCode={certificate.verificationCode} 
              />
            </div>
          )}

          {firstLesson && (
            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <Link href={`/cuenta/cursos/${params.courseSlug}/${firstLesson.slug}`}>
                <Button className="gap-2" size="lg">
                  <PlayCircle className="h-5 w-5" />
                  Ir a la primera lección
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
