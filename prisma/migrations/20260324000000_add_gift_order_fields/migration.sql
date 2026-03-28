-- Add isGiftOrder and giftToken fields to Order table

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "isGiftOrder" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "giftToken"   TEXT;

CREATE INDEX IF NOT EXISTS "Order_isGiftOrder_idx" ON "Order"("isGiftOrder");
CREATE INDEX IF NOT EXISTS "Order_giftToken_idx"   ON "Order"("giftToken");
