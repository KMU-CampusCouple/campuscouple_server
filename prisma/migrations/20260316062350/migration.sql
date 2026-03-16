/*
  Warnings:

  - You are about to drop the `ProfileImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProfileImage" DROP CONSTRAINT "ProfileImage_profileId_fkey";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "profileImages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "ProfileImage";
