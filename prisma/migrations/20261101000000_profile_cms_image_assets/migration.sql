ALTER TABLE "users" ADD COLUMN "image" TEXT;

CREATE TABLE "image_assets" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_assets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "image_assets_createdAt_idx" ON "image_assets"("createdAt");
