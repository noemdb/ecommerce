import type {
  Course,
  CourseModule,
  CourseLesson,
  LessonResource,
  CourseEnrollment,
  LessonProgress,
  CourseCertificate,
} from "@prisma/client";

export type CourseWithModules = Course & {
  modules: (CourseModule & {
    lessons: (CourseLesson & {
      resources: LessonResource[];
      progress: LessonProgress[];
    })[];
  })[];
};

export type EnrollmentWithCourse = CourseEnrollment & {
  course: CourseWithModules;
};

export type CustomerDashboardCourse = {
  enrollment: CourseEnrollment;
  course: Course;
  lastLesson: CourseLesson | null;
  totalLessons: number;
  certificate: CourseCertificate | null;
};
