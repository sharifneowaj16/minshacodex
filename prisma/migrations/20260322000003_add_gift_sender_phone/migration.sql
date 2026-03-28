-- Add senderPhone to GiftRequest
-- This was missing from previous migrations

ALTER TABLE "GiftRequest"
  ADD COLUMN IF NOT EXISTS "senderPhone" TEXT;
