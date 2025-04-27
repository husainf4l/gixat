/*
  Warnings:

  - You are about to drop the column `plateNumber` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `licensePlate` on the `Vehicle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[plateNumber]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'IN_SERVICE', 'OUT_OF_SERVICE', 'IN_REPAIR', 'COMPLETED', 'CANCELLED');

-- DropIndex
DROP INDEX "Vehicle_licensePlate_key";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "plateNumber",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "licensePlate",
ADD COLUMN     "plateNumber" TEXT,
ADD COLUMN     "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE';

-- DropEnum
DROP TYPE "ClientStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "Vehicle"("plateNumber");
