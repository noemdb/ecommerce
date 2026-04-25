-- CreateEnum
CREATE TYPE "ProfileFieldType" AS ENUM ('TEXT', 'HTML', 'IMAGE_URL', 'LINK', 'DATE', 'NUMBER');

-- CreateTable
CREATE TABLE "business_profile" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "fullName" TEXT NOT NULL DEFAULT '',
    "tagline" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "resumeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_sections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_fields" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fieldType" "ProfileFieldType" NOT NULL DEFAULT 'TEXT',
    "value" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_fields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_sections_slug_key" ON "profile_sections"("slug");

-- CreateIndex
CREATE INDEX "profile_sections_isPublished_isVisible_order_idx" ON "profile_sections"("isPublished", "isVisible", "order");

-- CreateIndex
CREATE INDEX "profile_fields_sectionId_isVisible_order_idx" ON "profile_fields"("sectionId", "isVisible", "order");

-- AddForeignKey
ALTER TABLE "profile_fields" ADD CONSTRAINT "profile_fields_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "profile_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
