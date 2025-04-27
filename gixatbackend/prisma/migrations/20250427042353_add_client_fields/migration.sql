/*
  Warnings:

  - You are about to drop the column `address` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Client` table. All the data in the column will be lost.
  - Added the required column `carModel` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobileNumber` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plateNumber` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- DropIndex
DROP INDEX "Client_email_key";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "email",
DROP COLUMN "notes",
DROP COLUMN "phone",
ADD COLUMN     "carModel" TEXT NOT NULL,
ADD COLUMN     "lastVisit" TIMESTAMP(3),
ADD COLUMN     "mobileNumber" TEXT NOT NULL,
ADD COLUMN     "plateNumber" TEXT NOT NULL,
ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE';
