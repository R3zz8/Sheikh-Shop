-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "firstName" VARCHAR(100),
ADD COLUMN     "gender" "public"."Gender",
ADD COLUMN     "lastName" VARCHAR(100),
ADD COLUMN     "profilePicture" VARCHAR(500),
ADD COLUMN     "username" VARCHAR(100);
