-- CreateEnum
CREATE TYPE "ProductCategoryType" AS ENUM ('SheikhFood', 'SheikhTech');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categoryType" "ProductCategoryType" NOT NULL DEFAULT 'SheikhFood';
