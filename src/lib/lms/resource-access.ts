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
