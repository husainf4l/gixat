-- CreateTable
CREATE TABLE "inspection_images" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inspectionId" TEXT NOT NULL,

    CONSTRAINT "inspection_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inspection_images_inspectionId_idx" ON "inspection_images"("inspectionId");

-- AddForeignKey
ALTER TABLE "inspection_images" ADD CONSTRAINT "inspection_images_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
