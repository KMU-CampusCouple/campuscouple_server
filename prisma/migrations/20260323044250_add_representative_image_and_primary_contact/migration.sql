-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "primaryContact" TEXT,
ADD COLUMN     "representativeImageIndex" INTEGER NOT NULL DEFAULT 0;
