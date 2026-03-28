-- CreateTable: AdminNotification

CREATE TABLE "AdminNotification" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "type"      TEXT NOT NULL DEFAULT 'ORDER',
    "title"     TEXT NOT NULL,
    "message"   TEXT NOT NULL,
    "isRead"    BOOLEAN NOT NULL DEFAULT false,
    "orderId"   TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminNotification_isRead_idx"    ON "AdminNotification"("isRead");
CREATE INDEX "AdminNotification_type_idx"      ON "AdminNotification"("type");
CREATE INDEX "AdminNotification_createdAt_idx" ON "AdminNotification"("createdAt");
CREATE INDEX "AdminNotification_orderId_idx"   ON "AdminNotification"("orderId");

-- AddForeignKey
ALTER TABLE "AdminNotification"
  ADD CONSTRAINT "AdminNotification_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
