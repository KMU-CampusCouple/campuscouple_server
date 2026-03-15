/*
  Warnings:

  - The `status` column on the `FriendRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[senderId,receiverId]` on the table `FriendRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED');

-- AlterTable
ALTER TABLE "FriendRequest" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "Friend" (
    "id" SERIAL NOT NULL,
    "user1Id" INTEGER NOT NULL,
    "user2Id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Friend_user1Id_user2Id_key" ON "Friend"("user1Id", "user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequest_senderId_receiverId_key" ON "FriendRequest"("senderId", "receiverId");

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
