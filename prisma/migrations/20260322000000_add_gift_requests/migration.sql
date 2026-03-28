-- CreateEnum
CREATE TYPE "GiftStatus" AS ENUM ('PENDING', 'VIEWED', 'ORDERED', 'EXPIRED');

-- CreateTable
CREATE TABLE "GiftRequest" (
    "id"            TEXT NOT NULL,
    "token"         TEXT NOT NULL,
    "productId"     TEXT NOT NULL,
    "variantId"     TEXT,
    "senderName"    TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "message"       TEXT,
    "status"        "GiftStatus" NOT NULL DEFAULT 'PENDING',
    "viewedAt"      TIMESTAMP(3),
    "orderedAt"     TIMESTAMP(3),
    "expiresAt"     TIMESTAMP(3) NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GiftRequest_token_key" ON "GiftRequest"("token");
CREATE INDEX "GiftRequest_token_idx" ON "GiftRequest"("token");
CREATE INDEX "GiftRequest_productId_idx" ON "GiftRequest"("productId");
CREATE INDEX "GiftRequest_status_idx" ON "GiftRequest"("status");

-- AddForeignKey
ALTER TABLE "GiftRequest"
    ADD CONSTRAINT "GiftRequest_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
