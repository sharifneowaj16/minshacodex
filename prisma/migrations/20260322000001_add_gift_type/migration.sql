-- Add giftType, requesterAddress, requesterPhone to GiftRequest
-- SEND_GIFT: আমি কাউকে gift পাঠাচ্ছি (sender pays)
-- GET_GIFT:  আমি কাউকে বলছি আমাকে gift করো (payer pays, requester receives)

ALTER TABLE "GiftRequest"
  ADD COLUMN IF NOT EXISTS "giftType"           TEXT NOT NULL DEFAULT 'SEND_GIFT',
  ADD COLUMN IF NOT EXISTS "requesterAddress"   JSONB,
  ADD COLUMN IF NOT EXISTS "requesterPhone"     TEXT;

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS "GiftRequest_giftType_idx" ON "GiftRequest"("giftType");
