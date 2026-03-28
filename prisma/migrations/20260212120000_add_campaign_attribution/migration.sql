-- CreateTable
CREATE TABLE "CampaignAttribution" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "deviceId" TEXT NOT NULL,
    "firstTouch" JSONB,
    "lastTouch" JSONB,
    "touchpoints" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignAttribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignAttribution_userId_key" ON "CampaignAttribution"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignAttribution_deviceId_key" ON "CampaignAttribution"("deviceId");

-- CreateIndex
CREATE INDEX "CampaignAttribution_userId_idx" ON "CampaignAttribution"("userId");

-- CreateIndex
CREATE INDEX "CampaignAttribution_deviceId_idx" ON "CampaignAttribution"("deviceId");

-- AddForeignKey
ALTER TABLE "CampaignAttribution" ADD CONSTRAINT "CampaignAttribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
