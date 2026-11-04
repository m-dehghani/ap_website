ALTER TABLE "payments" ADD COLUMN "expiresAt" TIMESTAMP(3);

UPDATE "payments"
SET "expiresAt" = "createdAt" + INTERVAL '15 minutes'
WHERE "method" = 'ZARINPAL'
  AND "status" = 'PENDING'
  AND "expiresAt" IS NULL;

CREATE INDEX "payments_method_status_expiresAt_idx"
ON "payments"("method", "status", "expiresAt");
