-- CreateTable
CREATE TABLE "TrackingDevice" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT,
    "firstTouchUtm" JSONB,
    "lastTouchUtm" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackingDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrackingDevice_deviceId_key" ON "TrackingDevice"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackingDevice_userId_key" ON "TrackingDevice"("userId");

-- CreateIndex
CREATE INDEX "TrackingDevice_userId_idx" ON "TrackingDevice"("userId");

-- CreateIndex
CREATE INDEX "TrackingDevice_deviceId_idx" ON "TrackingDevice"("deviceId");

-- AddForeignKey
ALTER TABLE "TrackingDevice" ADD CONSTRAINT "TrackingDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
