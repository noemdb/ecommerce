import { z } from "zod";
import { LessonFileType } from "@prisma/client";

// ── Constantes ───────────────────────────────────────────────────────────────

export const RESOURCE_SIGNED_URL_TTL_SECONDS = 300;
export const MAX_COURSE_TITLE_LENGTH = 255;
export const MAX_LESSON_TITLE_LENGTH = 255;
export const MAX_FILE_SIZE_PDF_BYTES = 2 * 1024 * 1024; // 2MB
export const MAX_FILE_SIZE_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB
export const MAX_FILE_SIZE_VIDEO_BYTES = 512 * 1024 * 1024; // 512MB

// ── Primitivos ───────────────────────────────────────────────────────────────

export const CuidSchema = z.string().cuid();
export const SlugSchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9-]+$/, "slug inválido");
export const FileKeySchema = z.string().min(1).max(512);

// ── Resource ─────────────────────────────────────────────────────────────────

export const ProtectedResourceResponseSchema = z.object({
  signedUrl: z.string().url(),
  expiresAt: z.date(),
  fileType: z.nativeEnum(LessonFileType),
  mimeType: z.string(),
  title: z.string(),
});

export const ResourceUploadMetaSchema = z.object({
  lessonId: CuidSchema,
  title: z.string().min(1).max(MAX_LESSON_TITLE_LENGTH),
  sortOrder: z.number().int().min(0).default(0),
});

// ── Course ───────────────────────────────────────────────────────────────────

export const CreateCourseSchema = z.object({
  title: z.string().min(1).max(MAX_COURSE_TITLE_LENGTH),
  slug: SlugSchema,
  description: z.string().max(5000).optional(),
  shortDescription: z.string().max(500).optional(),
  isPublished: z.boolean().default(false),
});

export const UpdateCourseSchema = CreateCourseSchema.partial().extend({
  id: CuidSchema,
});

// ── Module ───────────────────────────────────────────────────────────────────

export const CreateModuleSchema = z.object({
  courseId: CuidSchema,
  title: z.string().min(1).max(MAX_COURSE_TITLE_LENGTH),
  description: z.string().max(2000).optional(),
  position: z.number().int().min(0),
  isPublished: z.boolean().default(true),
});

export const UpdateModuleSchema = CreateModuleSchema.partial().extend({
  id: CuidSchema,
});

export const ReorderModulesSchema = z.object({
  courseId: CuidSchema,
  order: z.array(
    z.object({ id: CuidSchema, position: z.number().int().min(0) }),
  ),
});

// ── Lesson ───────────────────────────────────────────────────────────────────

export const CreateLessonSchema = z.object({
  moduleId: CuidSchema,
  title: z.string().min(1).max(MAX_LESSON_TITLE_LENGTH),
  slug: SlugSchema,
  content: z.string().max(100_000).optional(),
  durationSec: z.number().int().min(0).optional(),
  isPreview: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  position: z.number().int().min(0),
});

export const UpdateLessonSchema = CreateLessonSchema.partial().extend({
  id: CuidSchema,
});

export const MarkLessonCompleteSchema = z.object({
  lessonId: CuidSchema,
  watchedSec: z.number().int().min(0).optional(),
});

// ── Enrollment ───────────────────────────────────────────────────────────────

export const EnrollmentQuerySchema = z.object({
  courseId: CuidSchema,
});

// ── Certificate ──────────────────────────────────────────────────────────────

export const IssueCertificateSchema = z.object({
  enrollmentId: CuidSchema,
});

// ── Tipos inferidos ──────────────────────────────────────────────────────────

export type ProtectedResourceResponse = z.infer<
  typeof ProtectedResourceResponseSchema
>;
export type ResourceUploadMeta = z.infer<typeof ResourceUploadMetaSchema>;
export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;
export type CreateModuleInput = z.infer<typeof CreateModuleSchema>;
export type UpdateModuleInput = z.infer<typeof UpdateModuleSchema>;
export type CreateLessonInput = z.infer<typeof CreateLessonSchema>;
export type UpdateLessonInput = z.infer<typeof UpdateLessonSchema>;
export type MarkLessonCompleteInput = z.infer<typeof MarkLessonCompleteSchema>;
