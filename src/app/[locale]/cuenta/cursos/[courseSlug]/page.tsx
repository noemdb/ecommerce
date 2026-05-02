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
    <div className="flex h-[calc(100vh-theme(spacing.32))] flex-col md:flex-row gap-6 overflow-hidden">
      <CourseSidebar course={course} courseSlug={params.courseSlug} />
      
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-card rounded-lg border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {course.description || "Bienvenido al curso. Selecciona una lección en el panel lateral para comenzar."}
          </p>
        </div>

        <div className="bg-muted/50 p-6 rounded-lg space-y-6">
          <CourseProgressBar progress={enrollment?.progress ?? 0} />
          
          {enrollment?.progress === 100 && certificate && (
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-4">¡Felicidades, has completado el curso!</h3>
              <CertificateButton 
                certificateKey={certificate.certificateKey} 
                verificationCode={certificate.verificationCode} 
              />
            </div>
          )}

          {firstLesson && (
            <div className="pt-4 border-t">
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
