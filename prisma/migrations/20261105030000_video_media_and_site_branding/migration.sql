ALTER TABLE "news_articles"
  ADD COLUMN "uploaded_video_url" TEXT,
  ADD COLUMN "aparat_video_url" TEXT;

ALTER TABLE "shop_products"
  ADD COLUMN "uploaded_video_url" TEXT,
  ADD COLUMN "aparat_video_url" TEXT;

CREATE TABLE "site_branding" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "logo_url" TEXT,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "site_branding_pkey" PRIMARY KEY ("id")
);
