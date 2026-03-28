-- Add senderId and recipientId to GiftRequest
-- Social login verify করার পর User ID save হবে

ALTER TABLE "GiftRequest"
  ADD COLUMN IF NOT EXISTS "senderId"    TEXT,
  ADD COLUMN IF NOT EXISTS "recipientId" TEXT;

-- Foreign keys
ALTER TABLE "GiftRequest"
  ADD CONSTRAINT "GiftRequest_senderId_fkey"
    FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GiftRequest"
  ADD CONSTRAINT "GiftRequest_recipientId_fkey"
    FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "GiftRequest_senderId_idx"    ON "GiftRequest"("senderId");
CREATE INDEX IF NOT EXISTS "GiftRequest_recipientId_idx" ON "GiftRequest"("recipientId");
