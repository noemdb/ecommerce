import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

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
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;