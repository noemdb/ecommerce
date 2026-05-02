# SPEC-LMS-CORE-001 · v3.0

## Integración LMS Completa — Ecommerce Premium + Plataforma de Aprendizaje

### Incluye: SPEC-LMS-MEDIA-001 · v3.0 — Protección de Recursos Multimedia

**Clasificación:** Distinguished Engineer · Producción  
**Stack:** Next.js App Router (v16) · TypeScript strict · Prisma 5.x · PostgreSQL (Neon) · Auth.js v5 · UploadThing v7 · Zod 3.x · Resend · Vercel  
**Modo:** Especificación ejecutable para agentes IA (Cursor / Claude Code / Codex)  
**Versión:** v3.0  
**Fecha:** Abril 2026  
**Reemplaza:** Plan spec driven v1.0 (informal, sin contratos Zod, sin ADRs, sin tipado exhaustivo)

---

## ÍNDICE

1. [Objetivo y alcance](#1-objetivo-y-alcance)
2. [ADRs — Decisiones de arquitectura](#2-adrs--decisiones-de-arquitectura)
3. [Reglas de negocio canónicas](#3-reglas-de-negocio-canónicas)
4. [Schema Prisma completo](#4-schema-prisma-completo)
5. [Contratos Zod](#5-contratos-zod)
6. [Tipos compartidos](#6-tipos-compartidos)
7. [Errores estructurados](#7-errores-estructurados)
8. [Protección de recursos multimedia (SPEC-LMS-MEDIA-001)](#8-protección-de-recursos-multimedia-spec-lms-media-001)
9. [Capa de acceso — lib/lms](#9-capa-de-acceso--liblms)
10. [Server Actions](#10-server-actions)
11. [Flujo de matrícula automática](#11-flujo-de-matrícula-automática)
12. [UploadThing Router — ACL privado](#12-uploadthing-router--acl-privado)
13. [Rutas — App Router](#13-rutas--app-router)
14. [Componentes UI](#14-componentes-ui)
15. [Hooks del cliente](#15-hooks-del-cliente)
16. [Generación de certificados](#16-generación-de-certificados)
17. [Automatización de emails](#17-automatización-de-emails)
18. [Analítica y métricas](#18-analítica-y-métricas)
19. [Matriz de permisos RBAC](#19-matriz-de-permisos-rbac)
20. [Edge cases críticos](#20-edge-cases-críticos)
21. [Plan de implementación por fases](#21-plan-de-implementación-por-fases)
22. [Criterios de aceptación — Checklist de producción](#22-criterios-de-aceptación--checklist-de-producción)
23. [Extensiones futuras](#23-extensiones-futuras)

---

## 1. OBJETIVO Y ALCANCE

Integrar un **LMS completo** dentro del ecommerce existente de forma que:

- Clientes con `product.type === "SERVICE"` y orden en estado `PAID | APPROVED` obtengan acceso automático a cursos, módulos, lecciones, videos privados, recursos descargables, evaluaciones, certificados y seguimiento de progreso.
- El LMS sea completamente administrable por usuarios `ADMIN`.
- Los recursos multimedia sean inaccesibles por URL directa — solo accesibles mediante signed URLs con TTL de 300 segundos validadas contra matrícula activa.
- El sistema sea aislado del flujo de productos físicos y no rompa el checkout existente.

**Fuera del alcance v3.0:** quizzes, drip content, clases en vivo, SCORM, foros, instructores externos. Ver §23.

---

## 2. ADRs — DECISIONES DE ARQUITECTURA

### ADR-001 — `fileKey` exclusivo, sin `fileUrl` persistente

**Contexto:** Almacenar `fileUrl` expone URLs públicas de UploadThing en la DB. Una URL pública es explotable permanentemente incluso tras revocar acceso del usuario.

**Decisión:** `LessonResource` almacena únicamente `fileKey`. Toda URL de acceso se genera mediante `UTApi.generateSignedURL()` bajo demanda, con TTL de 300s. Ninguna URL firmada persiste en DB ni caché de larga duración.

**Consecuencias:** Columna `fileUrl` eliminada del schema. Backups de DB no contienen URLs explotables. Costo: una llamada a UploadThing API por acceso — aceptable dado el patrón de uso LMS.

**Alternativas descartadas:** CDN token con cookie (infraestructura adicional no justificada). Proxy propio (latencia y costos de egress).

---

### ADR-002 — Server Action como único entry point de acceso a recursos

**Contexto:** Si la lógica de validación vive en un Route Handler, es posible manipular headers o parámetros. Una Server Action tipada con Zod elimina este vector al no exponer endpoint REST equivalente.

**Decisión:** `requestProtectedLessonResource(resourceId)` es una Server Action que ejecuta la cadena completa de validación y retorna únicamente la URL firmada o un `ActionResult` con error. No existe endpoint REST equivalente para este flujo.

**Consecuencias:** DevTools del navegador no exponen ningún endpoint útil para replay attacks. El cliente no puede derivar ni construir signed URLs.

---

### ADR-003 — Matrícula automática via `upsert`, no `create`

**Contexto:** Un cliente puede recomprar el mismo servicio (regalo, re-enrolamiento). Un `create` simple lanzaría error de constraint único. Un `upsert` es idempotente por diseño.

**Decisión:** `autoEnrollCustomerToCourses` usa `prisma.courseEnrollment.upsert` con constraint `@@unique([customerId, courseId])`. El campo `orderId` en el `update` permanece vacío (no se sobreescribe con la nueva orden para preservar el historial de la primera matrícula).

**Consecuencias:** Re-compras no crean matrículas duplicadas ni errores. El `orderId` registrado es siempre el de la primera compra.

---

### ADR-004 — Progreso calculado on-demand, desnormalizado en `CourseEnrollment`

**Contexto:** Calcular progreso en tiempo real con `COUNT` de `LessonProgress` es correcto pero costoso en cursos grandes. Almacenarlo desnormalizado permite dashboards rápidos.

**Decisión:** `CourseEnrollment.progress` (Float 0-100) se actualiza en cada llamada a `markLessonComplete`. El campo actúa como caché desnormalizado. La fuente de verdad es `LessonProgress`.

**Consecuencias:** Si se añaden/eliminan lecciones, el progreso debe recalcularse con `recalculateCourseProgress(enrollmentId)`. El agente debe invocar esta función en mutations de `CourseLesson`.

---

### ADR-005 — ACL privado declarado en `middleware` del uploader, no en el cliente

**Contexto:** Si el ACL se configurara desde el cliente, un actor malicioso podría omitirlo en el request. El middleware del UploadThing router es server-side y no manipulable.

**Decisión:** Todos los uploaders LMS declaran `acl: "private" as const` en el `return` del middleware. Un archivo subido sin este flag queda público permanentemente — no es reversible sin re-subir.

---

## 3. REGLAS DE NEGOCIO CANÓNICAS

```
RN-001: Un cliente accede a un curso IFF:
        orders.status IN ('PAID', 'APPROVED')
        AND orderItems.product.type === 'SERVICE'
        AND product.courseId IS NOT NULL
        AND courseEnrollments.customerId = session.user.customerId

RN-002: La matrícula se crea automáticamente cuando order.status cambia a 'APPROVED'.
        El trigger es updateOrderStatusAction(). No existe matrícula manual por el cliente.

RN-003: Solo ADMIN puede CRUD sobre Course, CourseModule, CourseLesson, LessonResource.
        CUSTOMER solo puede leer sus propios cursos y escribir su propio LessonProgress.

RN-004: Ninguna URL de recurso multimedia es persistente. Toda URL tiene TTL ≤ 300s.
        El frontend solicita la URL on-demand antes de cada renderizado de recurso.

RN-005: Un certificado solo se emite cuando CourseEnrollment.progress === 100.
        La emisión es idempotente — CourseCertificate usa upsert por (customerId, courseId).

RN-006: El progreso se calcula como (lecciones completadas / total lecciones del curso) * 100.
        Las lecciones de módulos no publicados NO cuentan en el denominador.

RN-007: Un producto puede vincularse a exactamente un Course (1:1).
        Un Course puede tener múltiples Products vinculados (1:N hacia Product).
```

---

## 4. SCHEMA PRISMA COMPLETO

```prisma
// prisma/schema.prisma
// NOTA: agregar a schema existente — no reemplazar modelos ya existentes (Product, Order, Customer, etc.)

// ── Extensión de enum ProductType ───────────────────────────────────────────
enum ProductType {
  PHYSICAL
  DIGITAL
  SERVICE
}

// ── Extensión de Product (agregar campos) ───────────────────────────────────
// Si Product ya existe, agregar únicamente:
//   courseId  String?
//   course    Course? @relation(fields: [courseId], references: [id])

// ── Nuevos modelos LMS ───────────────────────────────────────────────────────

model Course {
  id               String              @id @default(cuid())
  title            String              @db.VarChar(255)
  slug             String              @unique @db.VarChar(255)
  description      String?             @db.Text
  shortDescription String?             @db.VarChar(500)
  thumbnailKey     String?             // fileKey de UploadThing — NO url pública
  isPublished      Boolean             @default(false)
  isActive         Boolean             @default(true)
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt

  modules          CourseModule[]
  enrollments      CourseEnrollment[]
  certificates     CourseCertificate[]
  products         Product[]
}

model CourseModule {
  id          String         @id @default(cuid())
  courseId    String
  title       String         @db.VarChar(255)
  description String?        @db.Text
  position    Int
  isPublished Boolean        @default(true)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  course      Course         @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons     CourseLesson[]

  @@index([courseId, position])
}

model CourseLesson {
  id          String           @id @default(cuid())
  moduleId    String
  title       String           @db.VarChar(255)
  slug        String           @db.VarChar(255)
  content     String?          @db.Text     // HTML enriquecido
  durationSec Int?                          // duración estimada en segundos
  isPreview   Boolean          @default(false)
  isPublished Boolean          @default(true)
  position    Int
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  module      CourseModule     @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  resources   LessonResource[]
  progress    LessonProgress[]

  @@unique([moduleId, slug])
  @@index([moduleId, position])
}

enum LessonFileType {
  PDF
  IMAGE
  VIDEO
  DOWNLOAD
}

model LessonResource {
  id          String           @id @default(cuid())
  lessonId    String
  title       String           @db.VarChar(255)
  fileKey     String           @unique      // NUNCA fileUrl — ver ADR-001
  fileType    LessonFileType
  mimeType    String           @db.VarChar(127)
  fileSize    Int                           // bytes
  durationSec Int?                          // solo VIDEO
  sortOrder   Int              @default(0)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  lesson      CourseLesson     @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@index([lessonId])
  @@index([fileKey])
}

model CourseEnrollment {
  id          String    @id @default(cuid())
  customerId  String
  courseId    String
  orderId     String                        // orden que originó la matrícula
  enrolledAt  DateTime  @default(now())
  completedAt DateTime?
  progress    Float     @default(0)         // 0-100, caché desnormalizado — ver ADR-004

  customer    Customer  @relation(fields: [customerId], references: [id])
  course      Course    @relation(fields: [courseId], references: [id])
  order       Order     @relation(fields: [orderId], references: [id])

  @@unique([customerId, courseId])
  @@index([customerId])
  @@index([courseId])
}

model LessonProgress {
  id          String        @id @default(cuid())
  customerId  String
  lessonId    String
  completed   Boolean       @default(false)
  completedAt DateTime?
  watchedSec  Int           @default(0)    // segundos vistos (para video analytics)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  customer    Customer      @relation(fields: [customerId], references: [id])
  lesson      CourseLesson  @relation(fields: [lessonId], references: [id])

  @@unique([customerId, lessonId])
  @@index([customerId])
  @@index([lessonId])
}

model CourseCertificate {
  id              String    @id @default(cuid())
  customerId      String
  courseId        String
  certificateKey  String?   // fileKey UploadThing del PDF generado
  verificationCode String   @unique @default(cuid()) // código de verificación público
  issuedAt        DateTime  @default(now())

  customer        Customer  @relation(fields: [customerId], references: [id])
  course          Course    @relation(fields: [courseId], references: [id])

  @@unique([customerId, courseId])
  @@index([verificationCode])
}
```

**Nota de migración desde v1:** Si existe `LessonResource.fileUrl`, ejecutar en dos fases:

1. Backfill `fileKey` extrayendo la key desde la URL (`url.pathname.split('/').pop()`)
2. `ALTER TABLE lesson_resources DROP COLUMN file_url` — solo después de validar §22 ítem 1.

---

## 5. CONTRATOS ZOD

```typescript
// src/lib/lms/schemas/lms.schemas.ts

import { z } from "zod";
import { LessonFileType, ProductType } from "@prisma/client";

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
export type CreateLessonInput = z.infer<typeof CreateLessonSchema>;
export type MarkLessonCompleteInput = z.infer<typeof MarkLessonCompleteSchema>;
```

---

## 6. TIPOS COMPARTIDOS

```typescript
// src/types/actions.ts

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// src/types/lms.ts

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
```

---

## 7. ERRORES ESTRUCTURADOS

```typescript
// src/lib/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, "UNAUTHORIZED");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "No encontrado") {
    super(message, "NOT_FOUND");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Sin permisos") {
    super(message, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto de datos") {
    super(message, "CONFLICT");
  }
}
```

---

## 8. PROTECCIÓN DE RECURSOS MULTIMEDIA (SPEC-LMS-MEDIA-001)

> **Integrado desde SPEC-LMS-MEDIA-001 · v3.0.** Esta sección es normativa y no opcional.

### 8.1 Principio de funcionamiento

El sistema **nunca** entrega `resource.fileKey` directamente al cliente ni construye URLs públicas. El flujo es:

```
1. validar sesión (Auth.js)
2. validar matrícula activa (Prisma)
3. solicitar signed URL a UploadThing (TTL 300s)
4. devolver URL temporal — no persiste en DB ni localStorage
```

### 8.2 Configuración ACL en UploadThing

Todos los uploaders LMS **deben** declarar `acl: "private"` en el `return` del middleware. Ver §12 para el router completo.

```typescript
// Extracto del patrón obligatorio:
.middleware(async ({ req }) => {
  // ... validar sesión y rol ...
  return { userId: session.user.id, ...meta, acl: "private" as const }
})
```

### 8.3 Tipos de archivo permitidos

| Tipo     | Máximo | Privado | Uso                   |
| -------- | ------ | ------- | --------------------- |
| PDF      | 2 MB   | Sí      | Materiales, guías     |
| Imagen   | 4 MB   | Sí      | Infografías, slides   |
| Video    | 512 MB | Sí      | Clases grabadas       |
| Download | 50 MB  | Sí      | ZIPs, recursos varios |

### 8.4 Caché y seguridad

- Las signed URLs **no deben persistirse** en DB, localStorage ni sessionStorage.
- El frontend las solicita on-demand via `useProtectedResource`.
- Expiración real: 300s. Margen de seguridad en cliente: 30s antes del TTL real.
- Las URLs firmadas **no deben cachearse** en `revalidatePath` ni `unstable_cache`.

### 8.5 Flujo de reemplazo de recurso

```
subir nuevo archivo via UploadThing (obtiene newFileKey)
→ llamar replaceLessonResource(resourceId, newFileKey)
→ actualizar fileKey en DB
→ eliminar fileKey anterior en UploadThing (fallo no-crítico, loguear)
```

### 8.6 Flujo de eliminación de recurso

```
llamar deleteLessonResource(resourceId)
→ eliminar en UploadThing primero (si falla → lanzar error, no tocar DB)
→ delete en DB
→ revalidatePath del curso
```

---

## 9. CAPA DE ACCESO — lib/lms

### 9.1 `resource-access.ts`

```typescript
// src/lib/lms/resource-access.ts
"use server";

import { prisma } from "@/lib/prisma";
import { utapi } from "@/lib/uploadthing";
import { UnauthorizedError, NotFoundError } from "@/lib/errors";
import {
  RESOURCE_SIGNED_URL_TTL_SECONDS,
  type ProtectedResourceResponse,
} from "./schemas/lms.schemas";

export async function getProtectedResourceUrl(
  resourceId: string,
  customerId: string,
): Promise<ProtectedResourceResponse> {
  const resource = await prisma.lessonResource.findUnique({
    where: { id: resourceId },
    include: {
      lesson: {
        select: {
          module: {
            select: {
              course: {
                select: {
                  enrollments: {
                    where: { customerId },
                    select: { id: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!resource) throw new NotFoundError("Recurso no encontrado");

  const enrolled = resource.lesson.module.course.enrollments.length > 0;
  if (!enrolled)
    throw new UnauthorizedError("Sin matrícula activa para este curso");

  const { ufsUrl } = await utapi.generateSignedURL(resource.fileKey, {
    expiresIn: RESOURCE_SIGNED_URL_TTL_SECONDS,
  });

  return {
    signedUrl: ufsUrl,
    expiresAt: new Date(Date.now() + RESOURCE_SIGNED_URL_TTL_SECONDS * 1000),
    fileType: resource.fileType,
    mimeType: resource.mimeType,
    title: resource.title,
  };
}

export async function deleteResourceWithFile(
  resourceId: string,
): Promise<void> {
  const resource = await prisma.lessonResource.findUnique({
    where: { id: resourceId },
  });
  if (!resource) throw new NotFoundError("Recurso no encontrado");

  // Primero UploadThing — si falla, DB queda intacta
  await utapi.deleteFiles([resource.fileKey]);
  await prisma.lessonResource.delete({ where: { id: resourceId } });
}

export async function replaceResourceFile(
  resourceId: string,
  newFileKey: string,
): Promise<void> {
  const resource = await prisma.lessonResource.findUnique({
    where: { id: resourceId },
  });
  if (!resource) throw new NotFoundError("Recurso no encontrado");

  const previousKey = resource.fileKey;

  // DB primero — fuente de verdad
  await prisma.lessonResource.update({
    where: { id: resourceId },
    data: { fileKey: newFileKey, updatedAt: new Date() },
  });

  // Eliminar anterior — fallo no-crítico
  try {
    await utapi.deleteFiles([previousKey]);
  } catch (err) {
    console.error("[replaceResourceFile] fallo al eliminar archivo anterior:", {
      previousKey,
      resourceId,
      err,
    });
  }
}
```

### 9.2 `enrollment.ts`

```typescript
// src/lib/lms/enrollment.ts

import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

/**
 * Crea matrículas para todos los items SERVICE de una orden.
 * Idempotente — usa upsert. Ver ADR-003.
 */
export async function autoEnrollCustomerToCourses(
  orderId: string,
): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { select: { type: true, courseId: true } },
        },
      },
    },
  });

  if (!order) throw new NotFoundError("Orden no encontrada");

  for (const item of order.items) {
    if (item.product.type !== "SERVICE") continue;
    if (!item.product.courseId) continue;

    await prisma.courseEnrollment.upsert({
      where: {
        customerId_courseId: {
          customerId: order.customerId,
          courseId: item.product.courseId,
        },
      },
      create: {
        customerId: order.customerId,
        courseId: item.product.courseId,
        orderId: order.id,
      },
      update: {}, // No sobreescribir — ver ADR-003
    });
  }
}

/**
 * Recalcula CourseEnrollment.progress desde LessonProgress.
 * Invocar tras add/remove lecciones y tras markLessonComplete.
 */
export async function recalculateCourseProgress(
  customerId: string,
  courseId: string,
): Promise<number> {
  const [totalLessons, completedLessons] = await Promise.all([
    prisma.courseLesson.count({
      where: {
        isPublished: true,
        module: { courseId, isPublished: true },
      },
    }),
    prisma.lessonProgress.count({
      where: {
        customerId,
        completed: true,
        lesson: {
          isPublished: true,
          module: { courseId, isPublished: true },
        },
      },
    }),
  ]);

  const progress =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  await prisma.courseEnrollment.update({
    where: { customerId_courseId: { customerId, courseId } },
    data: { progress, completedAt: progress === 100 ? new Date() : null },
  });

  return progress;
}
```

### 9.3 `access-guard.ts`

```typescript
// src/lib/lms/access-guard.ts

import { prisma } from "@/lib/prisma";
import { UnauthorizedError } from "@/lib/errors";

/**
 * Valida que customerId tenga matrícula activa en courseId.
 * Lanza UnauthorizedError si no — nunca retorna false.
 */
export async function requireCourseEnrollment(
  customerId: string,
  courseId: string,
): Promise<void> {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { customerId_courseId: { customerId, courseId } },
    select: { id: true },
  });
  if (!enrollment)
    throw new UnauthorizedError("Sin matrícula activa para este curso");
}

/**
 * Valida que el courseId exista y esté publicado.
 */
export async function requirePublishedCourse(courseId: string): Promise<void> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { isPublished: true, isActive: true },
  });
  if (!course || !course.isPublished || !course.isActive) {
    throw new UnauthorizedError("Curso no disponible");
  }
}
```

---

## 10. SERVER ACTIONS

### 10.1 `resource.actions.ts`

```typescript
// src/actions/lms/resource.actions.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  getProtectedResourceUrl,
  deleteResourceWithFile,
  replaceResourceFile,
} from "@/lib/lms/resource-access";
import {
  CuidSchema,
  FileKeySchema,
  type ProtectedResourceResponse,
} from "@/lib/lms/schemas/lms.schemas";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { ActionResult } from "@/types/actions";

// ── Acceso a recurso (CUSTOMER) ──────────────────────────────────────────────

export async function requestProtectedLessonResource(
  resourceId: string,
): Promise<ActionResult<ProtectedResourceResponse>> {
  const session = await auth();
  if (!session?.user?.customerId) return { ok: false, error: "No autenticado" };

  const parsed = CuidSchema.safeParse(resourceId);
  if (!parsed.success) return { ok: false, error: "resourceId inválido" };

  try {
    const data = await getProtectedResourceUrl(
      parsed.data,
      session.user.customerId,
    );
    return { ok: true, data };
  } catch (err) {
    if (err instanceof UnauthorizedError)
      return { ok: false, error: "Acceso denegado" };
    console.error("[requestProtectedLessonResource]", err);
    return { ok: false, error: "Error interno" };
  }
}

// ── Eliminación de recurso (ADMIN) ───────────────────────────────────────────

export async function deleteLessonResource(
  resourceId: string,
): Promise<ActionResult<void>> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
    return { ok: false, error: "Sin permisos" };

  const parsed = CuidSchema.safeParse(resourceId);
  if (!parsed.success) return { ok: false, error: "resourceId inválido" };

  try {
    const resource = await prisma.lessonResource.findUnique({
      where: { id: parsed.data },
      include: {
        lesson: { select: { module: { select: { courseId: true } } } },
      },
    });
    if (!resource) return { ok: false, error: "Recurso no encontrado" };

    await deleteResourceWithFile(parsed.data);
    revalidatePath(`/admin/lms/courses/${resource.lesson.module.courseId}`);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("[deleteLessonResource]", err);
    return { ok: false, error: "Error al eliminar recurso" };
  }
}

// ── Reemplazo de recurso (ADMIN) ─────────────────────────────────────────────

export async function replaceLessonResource(
  resourceId: string,
  newFileKey: string,
): Promise<ActionResult<void>> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
    return { ok: false, error: "Sin permisos" };

  const parsedId = CuidSchema.safeParse(resourceId);
  const parsedKey = FileKeySchema.safeParse(newFileKey);
  if (!parsedId.success || !parsedKey.success)
    return { ok: false, error: "Parámetros inválidos" };

  try {
    await replaceResourceFile(parsedId.data, parsedKey.data);
    revalidatePath("/admin/lms/courses");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("[replaceLessonResource]", err);
    return { ok: false, error: "Error al reemplazar recurso" };
  }
}
```

### 10.2 `progress.actions.ts`

```typescript
// src/actions/lms/progress.actions.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recalculateCourseProgress } from "@/lib/lms/enrollment";
import { requireCourseEnrollment } from "@/lib/lms/access-guard";
import { MarkLessonCompleteSchema } from "@/lib/lms/schemas/lms.schemas";
import { issueCertificateIfComplete } from "@/lib/lms/certificate";
import type { ActionResult } from "@/types/actions";

export async function markLessonComplete(
  input: unknown,
): Promise<ActionResult<{ progress: number }>> {
  const session = await auth();
  if (!session?.user?.customerId) return { ok: false, error: "No autenticado" };

  const parsed = MarkLessonCompleteSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.errors[0].message };

  const { lessonId, watchedSec } = parsed.data;
  const customerId = session.user.customerId;

  try {
    const lesson = await prisma.courseLesson.findUnique({
      where: { id: lessonId },
      select: { module: { select: { courseId: true } } },
    });
    if (!lesson) return { ok: false, error: "Lección no encontrada" };

    const courseId = lesson.module.courseId;
    await requireCourseEnrollment(customerId, courseId);

    await prisma.lessonProgress.upsert({
      where: { customerId_lessonId: { customerId, lessonId } },
      create: {
        customerId,
        lessonId,
        completed: true,
        completedAt: new Date(),
        watchedSec: watchedSec ?? 0,
      },
      update: {
        completed: true,
        completedAt: new Date(),
        ...(watchedSec !== undefined && { watchedSec }),
      },
    });

    const progress = await recalculateCourseProgress(customerId, courseId);

    if (progress === 100) {
      await issueCertificateIfComplete(customerId, courseId);
    }

    revalidatePath(`/cuenta/cursos`);
    return { ok: true, data: { progress } };
  } catch (err) {
    console.error("[markLessonComplete]", err);
    return { ok: false, error: "Error al guardar progreso" };
  }
}
```

### 10.3 `course.actions.ts`

```typescript
// src/actions/lms/course.actions.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  CreateCourseSchema,
  UpdateCourseSchema,
  CreateModuleSchema,
  ReorderModulesSchema,
  CreateLessonSchema,
} from "@/lib/lms/schemas/lms.schemas";
import type { ActionResult } from "@/types/actions";

function requireAdmin(role?: string): ActionResult<never> | null {
  if (role !== "ADMIN")
    return { ok: false, error: "Sin permisos de administrador" };
  return null;
}

// ── Course ────────────────────────────────────────────────────────────────────

export async function createCourse(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  const parsed = CreateCourseSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.errors[0].message };

  try {
    const course = await prisma.course.create({ data: parsed.data });
    revalidatePath("/admin/lms/courses");
    return { ok: true, data: { id: course.id } };
  } catch (err: any) {
    if (err.code === "P2002") return { ok: false, error: "El slug ya existe" };
    console.error("[createCourse]", err);
    return { ok: false, error: "Error al crear curso" };
  }
}

export async function updateCourse(
  input: unknown,
): Promise<ActionResult<void>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  const parsed = UpdateCourseSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.errors[0].message };

  const { id, ...data } = parsed.data;
  try {
    await prisma.course.update({ where: { id }, data });
    revalidatePath("/admin/lms/courses");
    revalidatePath(`/admin/lms/courses/${id}`);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("[updateCourse]", err);
    return { ok: false, error: "Error al actualizar curso" };
  }
}

export async function publishCourse(
  courseId: string,
): Promise<ActionResult<void>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  try {
    await prisma.course.update({
      where: { id: courseId },
      data: { isPublished: true },
    });
    revalidatePath("/admin/lms/courses");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("[publishCourse]", err);
    return { ok: false, error: "Error al publicar curso" };
  }
}

// ── Module ────────────────────────────────────────────────────────────────────

export async function createModule(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  const parsed = CreateModuleSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.errors[0].message };

  try {
    const module = await prisma.courseModule.create({ data: parsed.data });
    revalidatePath(`/admin/lms/courses/${parsed.data.courseId}`);
    return { ok: true, data: { id: module.id } };
  } catch (err) {
    console.error("[createModule]", err);
    return { ok: false, error: "Error al crear módulo" };
  }
}

export async function reorderModules(
  input: unknown,
): Promise<ActionResult<void>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  const parsed = ReorderModulesSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "Datos de reordenamiento inválidos" };

  const { courseId, order } = parsed.data;

  try {
    await prisma.$transaction(
      order.map(({ id, position }) =>
        prisma.courseModule.update({ where: { id }, data: { position } }),
      ),
    );
    revalidatePath(`/admin/lms/courses/${courseId}`);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("[reorderModules]", err);
    return { ok: false, error: "Error al reordenar módulos" };
  }
}

// ── Lesson ────────────────────────────────────────────────────────────────────

export async function createLesson(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  const parsed = CreateLessonSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.errors[0].message };

  try {
    const lesson = await prisma.courseLesson.create({ data: parsed.data });
    return { ok: true, data: { id: lesson.id } };
  } catch (err: any) {
    if (err.code === "P2002")
      return { ok: false, error: "El slug ya existe en este módulo" };
    console.error("[createLesson]", err);
    return { ok: false, error: "Error al crear lección" };
  }
}
```

---

## 11. FLUJO DE MATRÍCULA AUTOMÁTICA

### 11.1 Punto de activación

En `updateOrderStatusAction()`, cuando `newStatus === "APPROVED"`:

```typescript
// src/actions/orders/update-order-status.action.ts (extracto de integración)
"use server";

import { autoEnrollCustomerToCourses } from "@/lib/lms/enrollment";
import { sendEnrollmentEmail } from "@/lib/lms/emails";

// ... dentro de la acción existente, después de actualizar la orden:
if (newStatus === "APPROVED") {
  try {
    await autoEnrollCustomerToCourses(orderId);
    await sendEnrollmentEmail(orderId); // ver §17
  } catch (err) {
    // Log pero no lanzar — la orden ya fue aprobada
    console.error("[updateOrderStatus] fallo en matrícula automática:", err);
  }
}
```

**Regla de aislamiento:** Si `autoEnrollCustomerToCourses` falla, la orden **no** debe revertirse. El fallo de matrícula es recuperable manualmente; revertir la orden es destructivo.

### 11.2 Lógica completa

Ver `src/lib/lms/enrollment.ts` (§9.2). La función:

1. Carga la orden con items y productos
2. Filtra por `product.type === "SERVICE"` y `product.courseId !== null`
3. Ejecuta `upsert` por cada curso elegible
4. No emite emails (delegado al caller via `sendEnrollmentEmail`)

---

## 12. UPLOADTHING ROUTER — ACL PRIVADO

```typescript
// src/app/api/uploadthing/core.ts
// Agregar al router existente — no reemplazar otros uploaders

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";
import { ResourceUploadMetaSchema } from "@/lib/lms/schemas/lms.schemas";

const f = createUploadthing();

export const lmsFileRouter = {
  lessonResourceUploader: f({
    pdf: { maxFileSize: "2MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    video: { maxFileSize: "512MB", maxFileCount: 1 },
    blob: { maxFileSize: "50MB", maxFileCount: 1 }, // DOWNLOAD
  })
    .middleware(async ({ req }) => {
      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");
      if (session.user.role !== "ADMIN") throw new Error("Forbidden");

      const rawMeta = await req.json().catch(() => ({}));
      const meta = ResourceUploadMetaSchema.parse(rawMeta);

      // acl: "private" es el flag crítico — ver ADR-005
      return { userId: session.user.id, ...meta, acl: "private" as const };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // file.key = fileKey a persistir en LessonResource
      // file.url NO debe guardarse en DB — solo file.key
      await import("@/lib/prisma").then(({ prisma }) =>
        prisma.lessonResource.create({
          data: {
            lessonId: metadata.lessonId,
            title: metadata.title,
            fileKey: file.key, // ✅ solo fileKey
            fileType: detectFileType(file.type),
            mimeType: file.type,
            fileSize: file.size,
            sortOrder: metadata.sortOrder,
          },
        }),
      );
      return { fileKey: file.key };
    }),

  courseThumbnailUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");
      if (session.user.role !== "ADMIN") throw new Error("Forbidden");
      return { userId: session.user.id, acl: "private" as const };
    })
    .onUploadComplete(async ({ file }) => {
      return { fileKey: file.key };
    }),
} satisfies FileRouter;

export type LmsFileRouter = typeof lmsFileRouter;

function detectFileType(
  mimeType: string,
): import("@prisma/client").LessonFileType {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  return "DOWNLOAD";
}
```

---

## 13. RUTAS — APP ROUTER

### 13.1 Estructura de archivos

```
src/app/
├── [locale]/
│   └── cuenta/
│       └── cursos/
│           ├── page.tsx                          # dashboard cursos del cliente
│           └── [courseSlug]/
│               ├── page.tsx                      # detalle del curso
│               └── [lessonSlug]/
│                   └── page.tsx                  # visor de lección
│
└── admin/
    └── lms/
        ├── page.tsx                              # dashboard admin LMS
        ├── courses/
        │   ├── page.tsx                          # listado de cursos
        │   ├── new/
        │   │   └── page.tsx                      # crear curso
        │   └── [id]/
        │       ├── page.tsx                      # editar curso
        │       └── enrollments/
        │           └── page.tsx                  # alumnos matriculados
        └── analytics/
            └── page.tsx                          # métricas globales
```

### 13.2 Guards de ruta — middleware / layout

```typescript
// src/app/[locale]/cuenta/cursos/layout.tsx
import { auth }        from "@/auth"
import { redirect }    from "next/navigation"

export default async function CursosLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.customerId) redirect("/login")
  return <>{children}</>
}

// src/app/[locale]/cuenta/cursos/[courseSlug]/[lessonSlug]/page.tsx (extracto)
import { requireCourseEnrollment } from "@/lib/lms/access-guard"
import { notFound, redirect }      from "next/navigation"

export default async function LessonPage({ params }) {
  const session = await auth()
  const course  = await prisma.course.findUnique({ where: { slug: params.courseSlug } })
  if (!course) notFound()

  try {
    await requireCourseEnrollment(session.user.customerId, course.id)
  } catch {
    redirect(`/cuenta/cursos`)
  }

  // ... render
}
```

---

## 14. COMPONENTES UI

### 14.1 Cliente — árbol de componentes

```
src/components/lms/customer/
├── CourseCard.tsx           # miniatura, título, progreso, última lección
├── CourseProgressBar.tsx    # barra de progreso animada
├── CourseSidebar.tsx        # lista de módulos y lecciones con checkmarks
├── LessonResourceViewer.tsx # dispatcher por LessonFileType
├── ProtectedVideo.tsx       # <video> con signed URL, manejo de expiración
├── ProtectedPdf.tsx         # <iframe> con signed URL
├── ProtectedImage.tsx       # <img> con signed URL
├── ProtectedDownload.tsx    # <a download> con signed URL
└── CertificateButton.tsx    # botón de descarga de certificado
```

### 14.2 Administrador — árbol de componentes

```
src/components/lms/admin/
├── CourseEditor.tsx         # formulario de creación/edición de curso
├── ModuleManager.tsx        # drag-and-drop de módulos (dnd-kit)
├── LessonEditor.tsx         # editor enriquecido (Tiptap) + uploader recursos
├── ResourceUploader.tsx     # integración UploadThing lessonResourceUploader
├── EnrollmentTable.tsx      # tabla de alumnos matriculados con progreso
└── ProgressAnalytics.tsx    # gráficas de tasa de finalización y abandono
```

### 14.3 `LessonResourceViewer` — dispatcher

```typescript
// src/components/lms/customer/LessonResourceViewer.tsx
"use client"

import { useEffect, useState }           from "react"
import { useProtectedResource }          from "@/hooks/lms/use-protected-resource"
import { LessonFileType }                from "@prisma/client"
import type { ProtectedResourceResponse } from "@/lib/lms/schemas/lms.schemas"

export function LessonResourceViewer({ resourceId }: { resourceId: string }) {
  const { requestUrl, loading, error } = useProtectedResource(resourceId)
  const [resource, setResource]        = useState<ProtectedResourceResponse | null>(null)

  useEffect(() => {
    requestUrl().then(r => r && setResource(r))
  }, [resourceId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading)   return <ResourceSkeleton />
  if (error)     return <ResourceError message={error} />
  if (!resource) return null

  switch (resource.fileType) {
    case LessonFileType.VIDEO:    return <ProtectedVideo    src={resource.signedUrl} title={resource.title} />
    case LessonFileType.PDF:      return <ProtectedPdf      src={resource.signedUrl} title={resource.title} />
    case LessonFileType.IMAGE:    return <ProtectedImage    src={resource.signedUrl} title={resource.title} />
    case LessonFileType.DOWNLOAD: return <ProtectedDownload src={resource.signedUrl} title={resource.title} />
  }
}

function ResourceSkeleton() {
  return <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />
}

function ResourceError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
      {message}
    </div>
  )
}
```

---

## 15. HOOKS DEL CLIENTE

### 15.1 `use-protected-resource.ts`

```typescript
// src/hooks/lms/use-protected-resource.ts
"use client";

import { useState, useCallback } from "react";
import { requestProtectedLessonResource } from "@/actions/lms/resource.actions";
import type { ProtectedResourceResponse } from "@/lib/lms/schemas/lms.schemas";

const EXPIRY_SAFETY_MARGIN_MS = 30_000; // solicitar 30s antes del TTL real

interface State {
  data: ProtectedResourceResponse | null;
  loading: boolean;
  error: string | null;
  expiresAt: Date | null;
}

export function useProtectedResource(resourceId: string) {
  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
    expiresAt: null,
  });

  const isExpired = useCallback(() => {
    if (!state.expiresAt) return true;
    return Date.now() > state.expiresAt.getTime() - EXPIRY_SAFETY_MARGIN_MS;
  }, [state.expiresAt]);

  const requestUrl = useCallback(async () => {
    if (!isExpired() && state.data) return state.data;

    setState((s) => ({ ...s, loading: true, error: null }));
    const result = await requestProtectedLessonResource(resourceId);

    if (!result.ok) {
      setState((s) => ({ ...s, loading: false, error: result.error }));
      return null;
    }

    setState({
      data: result.data,
      loading: false,
      error: null,
      expiresAt: result.data.expiresAt,
    });
    return result.data;
  }, [resourceId, isExpired, state.data]);

  return { ...state, requestUrl, isExpired };
}
```

---

## 16. GENERACIÓN DE CERTIFICADOS

```typescript
// src/lib/lms/certificate.ts

import { prisma } from "@/lib/prisma";
import { utapi } from "@/lib/uploadthing";

/**
 * Emite certificado si el progress es 100 y no existe uno previo.
 * Idempotente — usa upsert por (customerId, courseId).
 */
export async function issueCertificateIfComplete(
  customerId: string,
  courseId: string,
): Promise<void> {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { customerId_courseId: { customerId, courseId } },
    include: {
      customer: { select: { name: true } },
      course: { select: { title: true } },
    },
  });

  if (!enrollment || enrollment.progress < 100) return;

  const verificationCode = crypto.randomUUID();

  // Generar PDF del certificado
  const pdfBuffer = await generateCertificatePdf({
    studentName: enrollment.customer.name ?? "Estudiante",
    courseName: enrollment.course.title,
    completionDate: new Date(),
    verificationCode,
  });

  // Subir a UploadThing como privado
  const uploadResult = await utapi.uploadFiles(
    new File([pdfBuffer], `certificado-${verificationCode}.pdf`, {
      type: "application/pdf",
    }),
    { acl: "private" },
  );

  const certificateKey = uploadResult.data?.key ?? null;

  await prisma.courseCertificate.upsert({
    where: { customerId_courseId: { customerId, courseId } },
    create: { customerId, courseId, certificateKey, verificationCode },
    update: { certificateKey },
  });
}

async function generateCertificatePdf(data: {
  studentName: string;
  courseName: string;
  completionDate: Date;
  verificationCode: string;
}): Promise<Buffer> {
  // Implementar con @react-pdf/renderer o puppeteer
  // Retornar Buffer del PDF generado
  throw new Error("Implementar generación de PDF — usar @react-pdf/renderer");
}
```

---

## 17. AUTOMATIZACIÓN DE EMAILS

```typescript
// src/lib/lms/emails.ts

import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { render } from "@react-email/render";

export async function sendEnrollmentEmail(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: { select: { email: true, name: true } },
      items: {
        include: {
          product: {
            include: { course: { select: { title: true, slug: true } } },
          },
        },
      },
    },
  });

  if (!order) return;

  const courses = order.items
    .filter((i) => i.product.type === "SERVICE" && i.product.course)
    .map((i) => i.product.course!);

  if (courses.length === 0) return;

  for (const course of courses) {
    await resend.emails.send({
      from: "academia@tudominio.com",
      to: order.customer.email,
      subject: `Tu curso "${course.title}" ya está disponible`,
      html: await render(
        EnrollmentEmailTemplate({
          studentName: order.customer.name ?? "Estudiante",
          courseName: course.title,
          courseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/cuenta/cursos/${course.slug}`,
        }),
      ),
    });
  }
}

export async function sendCompletionEmail(
  customerId: string,
  courseId: string,
): Promise<void> {
  // Implementar email de finalización con enlace al certificado
}
```

---

## 18. ANALÍTICA Y MÉTRICAS

### 18.1 Queries de analítica (RSC — no server actions)

```typescript
// src/lib/lms/analytics.ts

import { prisma } from "@/lib/prisma";

export async function getLmsAnalytics(courseId?: string) {
  const [totalEnrollments, completedEnrollments, avgProgress, activeStudents] =
    await Promise.all([
      prisma.courseEnrollment.count({ where: courseId ? { courseId } : {} }),
      prisma.courseEnrollment.count({
        where: {
          ...(courseId ? { courseId } : {}),
          completedAt: { not: null },
        },
      }),
      prisma.courseEnrollment.aggregate({
        where: courseId ? { courseId } : {},
        _avg: { progress: true },
      }),
      prisma.courseEnrollment.count({
        where: {
          ...(courseId ? { courseId } : {}),
          updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

  return {
    totalEnrollments,
    completionRate:
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0,
    avgProgress: Math.round(avgProgress._avg.progress ?? 0),
    activeStudents,
  };
}
```

### 18.2 Métricas a registrar

| Métrica              | Fuente                                  |
| -------------------- | --------------------------------------- |
| Total matrículas     | `COUNT(CourseEnrollment)`               |
| Tasa de finalización | `completedAt IS NOT NULL / total`       |
| Progreso promedio    | `AVG(CourseEnrollment.progress)`        |
| Estudiantes activos  | `updatedAt > NOW() - 30d`               |
| Abandono por curso   | `progress < 10 AND enrolledAt < 7d ago` |
| Tiempo de consumo    | `SUM(LessonProgress.watchedSec)`        |

---

## 19. MATRIZ DE PERMISOS RBAC

| Operación                          | ADMIN | CUSTOMER (propio) | Sin sesión        |
| ---------------------------------- | ----- | ----------------- | ----------------- |
| Crear/editar/eliminar Course       | ✅    | ❌                | ❌                |
| Publicar Course                    | ✅    | ❌                | ❌                |
| Crear/editar/eliminar Module       | ✅    | ❌                | ❌                |
| Crear/editar/eliminar Lesson       | ✅    | ❌                | ❌                |
| Subir LessonResource               | ✅    | ❌                | ❌                |
| Eliminar/reemplazar LessonResource | ✅    | ❌                | ❌                |
| Ver lista de cursos propios        | ✅    | ✅                | ❌                |
| Acceder a lección (matriculado)    | ✅    | ✅                | ❌                |
| Acceder a lección (preview)        | ✅    | ✅                | ✅ (solo preview) |
| Solicitar signed URL de recurso    | ✅    | ✅ (matriculado)  | ❌                |
| Marcar lección completa            | ✅    | ✅ (propio)       | ❌                |
| Ver progreso de otros              | ✅    | ❌                | ❌                |
| Emitir certificado                 | ✅    | ❌ (automático)   | ❌                |
| Descargar certificado propio       | ✅    | ✅ (propio)       | ❌                |
| Ver analítica global               | ✅    | ❌                | ❌                |

---

## 20. EDGE CASES CRÍTICOS

### 20.1 Video con URL expirada mid-playback

El `<video onError>` debe detectar el error 403 y re-invocar `requestUrl()`. Si el usuario lleva más de 270s viendo un video, la URL puede expirar. Solución: polling con `setInterval` cada 240s para refresh proactivo de la URL mientras el video está en play.

### 20.2 Race condition en replace de recurso

Si dos admins reemplazan el mismo recurso simultáneamente, el segundo puede eliminar el `fileKey` recién subido por el primero. Mitigación: lock optimista via `updatedAt` en el `update` de Prisma:

```typescript
await prisma.lessonResource.update({
  where: { id: resourceId, updatedAt: resource.updatedAt }, // optimistic lock
  data: { fileKey: newFileKey, updatedAt: new Date() },
});
```

### 20.3 UploadThing rate limits

`generateSignedURL` tiene límites por plan. En cursos con 50+ alumnos simultáneos, implementar caché en memoria o Redis:

```typescript
// Cache key: `signed-url:${resourceId}:${customerId}`
// TTL: 240s (60s antes del TTL real)
```

### 20.4 Migración desde fileUrl legacy

Si existen registros con URL pública, ejecutar script de backfill:

```typescript
// fileKey = url.pathname.split('/').pop()
// Verificar que el archivo sea accesible antes de eliminar fileUrl
// Ejecutar en batch de 100 registros con delay de 500ms entre batches
```

### 20.5 Enrollments con expiración futura

Si se añade `expiresAt` a `CourseEnrollment`, la query en `requireCourseEnrollment` debe incluir:

```typescript
where: {
  customerId_courseId: { customerId, courseId },
  OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
}
```

### 20.6 Re-cálculo de progreso tras eliminar lección

Cuando un ADMIN elimina una lección publicada, invocar:

```typescript
// En deleteLessonAction():
const affectedEnrollments = await prisma.courseEnrollment.findMany({
  where: { courseId },
});
await Promise.all(
  affectedEnrollments.map((e) =>
    recalculateCourseProgress(e.customerId, courseId),
  ),
);
```

### 20.7 Matrícula en orden fallida

Si `autoEnrollCustomerToCourses` lanza error, la orden ya fue aprobada. Implementar tabla `FailedEnrollmentJob` o usar una queue (inngest / trigger.dev) para reintentos automáticos.

---

## 21. PLAN DE IMPLEMENTACIÓN POR FASES

### Fase 1 — Schema y migraciones

- [ ] Agregar `ProductType.SERVICE` y `courseId` a `Product`
- [ ] Crear todos los modelos LMS en `schema.prisma`
- [ ] Ejecutar `prisma migrate dev --name add-lms`
- [ ] Ejecutar `prisma generate`

### Fase 2 — Backend core

- [ ] `src/lib/errors.ts`
- [ ] `src/types/actions.ts` y `src/types/lms.ts`
- [ ] `src/lib/lms/schemas/lms.schemas.ts`
- [ ] `src/lib/lms/resource-access.ts`
- [ ] `src/lib/lms/enrollment.ts`
- [ ] `src/lib/lms/access-guard.ts`

### Fase 3 — UploadThing y Server Actions

- [ ] Agregar `lmsFileRouter` a `src/app/api/uploadthing/core.ts`
- [ ] `src/actions/lms/resource.actions.ts`
- [ ] `src/actions/lms/progress.actions.ts`
- [ ] `src/actions/lms/course.actions.ts`
- [ ] Integrar `autoEnrollCustomerToCourses` en `updateOrderStatusAction`

### Fase 4 — Portal cliente

- [ ] `src/hooks/lms/use-protected-resource.ts`
- [ ] Componentes de renderizado por tipo (Video, PDF, Imagen, Download)
- [ ] Ruta `/cuenta/cursos` con `CourseCard`
- [ ] Ruta `/cuenta/cursos/[courseSlug]` con `CourseSidebar`
- [ ] Ruta `/cuenta/cursos/[courseSlug]/[lessonSlug]` con `LessonResourceViewer`

### Fase 5 — Panel admin

- [ ] `CourseEditor`, `ModuleManager`, `LessonEditor`
- [ ] `ResourceUploader` con UploadThing
- [ ] `EnrollmentTable` con progreso por alumno
- [ ] Rutas `/admin/lms/**`

### Fase 6 — Certificados y emails

- [ ] `src/lib/lms/certificate.ts` con generación PDF
- [ ] `src/lib/lms/emails.ts` con Resend
- [ ] Integración en `markLessonComplete` y `autoEnrollCustomerToCourses`

### Fase 7 — Analítica

- [ ] `src/lib/lms/analytics.ts`
- [ ] Dashboard `/admin/lms/analytics`
- [ ] Registro de `watchedSec` en `LessonProgress`

---

## 22. CRITERIOS DE ACEPTACIÓN — CHECKLIST DE PRODUCCIÓN

### Multimedia y seguridad (SPEC-LMS-MEDIA-001)

- [ ] Schema sin columna `fileUrl` — `grep -r "fileUrl" prisma/` → sin resultados
- [ ] ACL privado verificado — subir archivo anónimo → URL directa retorna 403
- [ ] URL firmada expira en ≤ 300s — esperar 6 min → 403
- [ ] Frontend sin URLs en localStorage — DevTools → Application → Storage → vacío
- [ ] `fileKey` nunca expuesto al cliente en response logs
- [ ] `deleteLessonResource` elimina en UploadThing antes de DB
- [ ] `replaceLessonResource` elimina fileKey anterior tras actualizar DB
- [ ] Video con URL expirada mid-playback → re-request automático

### Matrícula

- [ ] Orden APPROVED → matrícula creada automáticamente
- [ ] Re-compra del mismo servicio → no duplica matrícula
- [ ] Orden PHYSICAL → no genera matrícula LMS
- [ ] Producto SERVICE sin `courseId` → no genera matrícula (no lanza error)

### Control de acceso

- [ ] `curl` sin cookie → `{ ok: false, error: "No autenticado" }`
- [ ] Usuario sin enrollment → `UnauthorizedError` en signed URL
- [ ] Usuario con enrollment de otro curso → acceso denegado en lección correcta
- [ ] CUSTOMER no puede acceder a rutas `/admin/lms/**`

### Progreso y certificados

- [ ] Marcar lección completa → `CourseEnrollment.progress` actualizado
- [ ] 100% completado → `CourseCertificate` creado (idempotente)
- [ ] Eliminar lección publicada → recalcula progreso de todos los alumnos
- [ ] Certificado retorna signed URL, no URL pública

### Admin

- [ ] CRUD Course con Zod validation en Server Action
- [ ] Reordenar módulos en transacción atómica
- [ ] Publicar curso → visible en portal cliente
- [ ] `EnrollmentTable` muestra progreso real-time

---

## 23. EXTENSIONES FUTURAS

Módulos no incluidos en v3.0, listos para sprint posterior:

| Módulo           | Prerequisito en schema actual                              |
| ---------------- | ---------------------------------------------------------- |
| Quizzes          | Agregar `LessonQuiz`, `QuizAttempt`                        |
| Drip content     | Agregar `CourseLesson.availableAt: DateTime?`              |
| Suscripciones    | Agregar `Subscription` con `expiresAt` en Enrollment       |
| Instructores     | Agregar rol `INSTRUCTOR`, campo `instructorId` en `Course` |
| Clases en vivo   | Agregar `LiveSession` con Zoom SDK / Daily.co              |
| Foros            | Agregar `CourseThread`, `ThreadReply`                      |
| SCORM            | Reemplazar `LessonProgress` por xAPI statement store       |
| Integración Zoom | Webhook `meeting.ended` → marcar lección completada        |

---

_SPEC-LMS-CORE-001 v3.0 — Distinguished Engineer · Producción_  
_Incluye SPEC-LMS-MEDIA-001 v3.0 — Protección de Recursos Multimedia_  
_Listo para ejecución por agente IA sin ambigüedad estructural._
