-- CreateTable: search_click_events
-- Stores individual click events when users click a search result
CREATE TABLE "search_click_events" (
    "id"          TEXT NOT NULL,
    "query"       TEXT NOT NULL,
    "productId"   TEXT NOT NULL,
    "position"    INTEGER NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "filters"     TEXT,
    "category"    TEXT,
    "price"       DOUBLE PRECISION,
    "score"       DOUBLE PRECISION,
    "userId"      TEXT,
    "deviceId"    TEXT,
    "sessionId"   TEXT,
    "clickedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_click_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable: search_click_metrics
-- Aggregated click metrics per (query, product) pair for CTR analytics
CREATE TABLE "search_click_metrics" (
    "id"          TEXT NOT NULL,
    "query"       TEXT NOT NULL,
    "productId"   TEXT NOT NULL,
    "avgPosition" DOUBLE PRECISION NOT NULL,
    "clicks"      INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue"     DOUBLE PRECISION NOT NULL DEFAULT 0,
    "resultCount" INTEGER,
    "lastClicked" TIMESTAMP(3) NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_click_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "search_click_events_query_idx" ON "search_click_events"("query");
CREATE INDEX "search_click_events_productId_idx" ON "search_click_events"("productId");
CREATE INDEX "search_click_events_userId_idx" ON "search_click_events"("userId");
CREATE INDEX "search_click_events_sessionId_idx" ON "search_click_events"("sessionId");
CREATE INDEX "search_click_events_clickedAt_idx" ON "search_click_events"("clickedAt");

CREATE UNIQUE INDEX "search_click_metrics_query_productId_key" ON "search_click_metrics"("query", "productId");
CREATE INDEX "search_click_metrics_query_idx" ON "search_click_metrics"("query");
CREATE INDEX "search_click_metrics_productId_idx" ON "search_click_metrics"("productId");
CREATE INDEX "search_click_metrics_clicks_idx" ON "search_click_metrics"("clicks");

-- AddForeignKey
ALTER TABLE "search_click_events" ADD CONSTRAINT "search_click_events_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "search_click_events" ADD CONSTRAINT "search_click_events_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "search_click_metrics" ADD CONSTRAINT "search_click_metrics_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
