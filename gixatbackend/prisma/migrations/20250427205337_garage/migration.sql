/*
  Warnings:

  - You are about to alter the column `phone` on the `customers` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.

*/
-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "phone" SET DATA TYPE VARCHAR(15);

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "customers"("name");
