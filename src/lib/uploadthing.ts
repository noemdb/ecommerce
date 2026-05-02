import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { auth } from "@/auth";
import { ResourceUploadMetaSchema } from "./lms/schemas/lms.schemas";
import { prisma } from "./prisma";
import type { LessonFileType } from "@prisma/client";

export const utapi = new UTApi();

const f = createUploadthing();

function detectFileType(mimeType: string): LessonFileType {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  return "DOWNLOAD";
}

export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      // Aquí puedes agregar validaciones, como verificar autenticación
      return { uploadedBy: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.uploadedBy);
      console.log("file url", file.ufsUrl);
      return { uploadedBy: metadata.uploadedBy, url: file.ufsUrl };
    }),

  receiptImage: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      // Para recibos de pago permitimos invitados, opcionalmente podrías checkear sesión
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Receipt Upload complete:", file.ufsUrl);
      return { url: file.ufsUrl };
    }),

  profileImage: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      return { uploadedBy: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile image upload complete:", file.ufsUrl);
      return { uploadedBy: metadata.uploadedBy, url: file.ufsUrl };
    }),

  siteConfigImage: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      return { uploadedBy: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.uploadedBy, url: file.ufsUrl };
    }),

  resumeFile: f({ pdf: { maxFileSize: "8MB" } })
    .middleware(async () => {
      return { uploadedBy: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Resume upload complete:", file.ufsUrl);
      return { uploadedBy: metadata.uploadedBy, url: file.ufsUrl };
    }),

  // ── LMS Uploaders ──────────────────────────────────────────────────────────

  lessonResourceUploader: f({
    pdf: { maxFileSize: "2MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    video: { maxFileSize: "512MB", maxFileCount: 1 },
    blob: { maxFileSize: "64MB", maxFileCount: 1 }, // DOWNLOAD
  })
    .input(ResourceUploadMetaSchema)
    .middleware(async ({ req, input }) => {
      const session = await auth();
      if (!session?.user?.id) throw new UploadThingError("Unauthorized");
      if (session.user.role !== "ADMIN") throw new UploadThingError("Forbidden");

      const meta = input;

      // acl: "private" es el flag crítico — ver ADR-005
      return { userId: session.user.id, ...meta, acl: "private" as const };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // file.key = fileKey a persistir en LessonResource
      // file.url NO debe guardarse en DB — solo file.key
      await prisma.lessonResource.create({
        data: {
          lessonId: metadata.lessonId,
          title: metadata.title,
          fileKey: file.key, // ✅ solo fileKey
          fileType: detectFileType(file.type),
          mimeType: file.type,
          fileSize: file.size,
          sortOrder: metadata.sortOrder,
        },
      });
      return { fileKey: file.key };
    }),

  courseThumbnailUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) throw new UploadThingError("Unauthorized");
      if (session.user.role !== "ADMIN") throw new UploadThingError("Forbidden");
      return { userId: session.user.id, acl: "private" as const };
    })
    .onUploadComplete(async ({ file }) => {
      return { fileKey: file.key };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;