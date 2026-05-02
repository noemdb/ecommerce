import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CourseProgressBar } from "./CourseProgressBar";
import type { CustomerDashboardCourse } from "@/types/lms";

export function CourseCard({ dashboardData }: { dashboardData: CustomerDashboardCourse }) {
  const { course, enrollment, lastLesson, totalLessons } = dashboardData;
  const isComplete = enrollment.progress === 100;
  
  // En un caso real, el href sería idealmente a la última lección vista o la primera disponible.
  const continueUrl = `/cuenta/cursos/${course.slug}`;

  return (
    <Card className="flex flex-col overflow-hidden transition-colors hover:border-primary/50">
      <CardHeader className="border-b p-0">
        <div className="aspect-video w-full bg-muted flex items-center justify-center">
           {course.thumbnailKey ? (
             // Idealmente se integraría uploadthing URL aquí o next/image con ufsUrl
             <span className="text-muted-foreground">Course Thumbnail</span>
           ) : (
             <PlayCircle className="h-12 w-12 text-muted-foreground/50" />
           )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-6">
        <CardTitle className="line-clamp-2 mb-2">{course.title}</CardTitle>
        <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
          {course.shortDescription || "Sin descripción"}
        </p>
        <CourseProgressBar progress={enrollment.progress} />
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link href={continueUrl} className="w-full">
          <Button className="w-full" variant={isComplete ? "outline" : "primary"}>
            {isComplete ? "Repasar Curso" : (enrollment.progress > 0 ? "Continuar" : "Comenzar")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
