ALTER TABLE "users"
ADD COLUMN "theme_preference" TEXT NOT NULL DEFAULT 'system';

ALTER TABLE "coaches"
ADD COLUMN "theme_preference" TEXT NOT NULL DEFAULT 'system';
