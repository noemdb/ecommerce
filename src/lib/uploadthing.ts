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
      console.log("file url", file.url);
      return { uploadedBy: metadata.uploadedBy, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;