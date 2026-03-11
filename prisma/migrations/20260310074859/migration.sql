-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('OPEN', 'CLOSED', 'FINISHED', 'CANCELED');

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "status" "MeetingStatus" NOT NULL DEFAULT 'OPEN';
