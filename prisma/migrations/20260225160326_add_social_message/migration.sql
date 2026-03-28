-- CreateTable
CREATE TABLE "SocialMessage" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "externalId" TEXT,
    "conversationId" TEXT,
    "postId" TEXT,
    "senderId" TEXT,
    "senderName" TEXT,
    "senderAvatar" TEXT,
    "content" TEXT NOT NULL,
    "isIncoming" BOOLEAN NOT NULL DEFAULT true,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SocialMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialMessage_platform_idx" ON "SocialMessage"("platform");

-- CreateIndex
CREATE INDEX "SocialMessage_isRead_idx" ON "SocialMessage"("isRead");

-- CreateIndex
CREATE INDEX "SocialMessage_timestamp_idx" ON "SocialMessage"("timestamp");
