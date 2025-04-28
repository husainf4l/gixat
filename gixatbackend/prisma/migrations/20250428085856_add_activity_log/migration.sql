-- CreateEnum
CREATE TYPE "ActivityLogType" AS ENUM ('SESSION_CREATED', 'SESSION_UPDATED', 'STATUS_CHANGED', 'INSPECTION_CREATED', 'INSPECTION_UPDATED', 'PRE_JOBCARD_CREATED', 'PRE_JOBCARD_UPDATED', 'QUOTATION_CREATED', 'QUOTATION_SENT', 'QUOTATION_APPROVED', 'QUOTATION_REJECTED', 'JOBCARD_CREATED', 'JOBCARD_UPDATED', 'CAR_INFO_UPDATED', 'ENTRY_ADDED', 'SYSTEM_ACTION', 'CUSTOMER_INTERACTION');

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "type" "ActivityLogType" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_sessionId_idx" ON "activity_logs"("sessionId");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
