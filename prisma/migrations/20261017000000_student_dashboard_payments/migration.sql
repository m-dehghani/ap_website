ALTER TABLE "payments" ADD COLUMN "providerReference" TEXT;
CREATE INDEX "payments_providerReference_method_idx" ON "payments"("providerReference", "method");
