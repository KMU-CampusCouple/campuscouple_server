/*
  Warnings:

  - A unique constraint covering the columns `[meetingId,profileId]` on the table `MeetingParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupId` to the `MeetingParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MeetingParticipant" ADD COLUMN     "groupId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MeetingParticipant_meetingId_profileId_key" ON "MeetingParticipant"("meetingId", "profileId");
