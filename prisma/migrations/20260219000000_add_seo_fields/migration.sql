-- AlterTable: Add new SEO and structured data fields to Product
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "bengaliName"        TEXT,
  ADD COLUMN IF NOT EXISTS "bengaliDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "focusKeyword"       TEXT,
  ADD COLUMN IF NOT EXISTS "ogTitle"            TEXT,
  ADD COLUMN IF NOT EXISTS "ogImageUrl"         TEXT,
  ADD COLUMN IF NOT EXISTS "canonicalUrl"       TEXT,
  ADD COLUMN IF NOT EXISTS "condition"          TEXT DEFAULT 'NEW',
  ADD COLUMN IF NOT EXISTS "gtin"               TEXT,
  ADD COLUMN IF NOT EXISTS "averageRating"      DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS "reviewCount"        INTEGER NOT NULL DEFAULT 0;

-- AlterTable: Add title field to ProductImage
ALTER TABLE "ProductImage"
  ADD COLUMN IF NOT EXISTS "title" TEXT;
