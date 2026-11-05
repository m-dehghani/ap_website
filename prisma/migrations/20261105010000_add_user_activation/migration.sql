ALTER TABLE "users" ADD COLUMN "activatedAt" TIMESTAMP(3);

UPDATE "users"
SET "activatedAt" = "createdAt"
WHERE "activatedAt" IS NULL;

ALTER TABLE "users"
ALTER COLUMN "activatedAt" SET DEFAULT CURRENT_TIMESTAMP;
