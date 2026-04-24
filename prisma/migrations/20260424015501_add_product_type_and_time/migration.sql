-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PRODUCT', 'SERVICE');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "time" INTEGER DEFAULT 0,
ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'PRODUCT';
