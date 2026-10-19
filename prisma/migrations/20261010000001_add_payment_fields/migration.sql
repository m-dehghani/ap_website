-- Add new columns to payments table
ALTER TABLE "payments" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'IRR';
ALTER TABLE "payments" ADD COLUMN "stripePaymentIntentId" TEXT;
ALTER TABLE "payments" ADD COLUMN "stripeSessionId" TEXT;

-- Create unique index for stripePaymentIntentId
CREATE UNIQUE INDEX "payments_stripePaymentIntentId_key" ON "payments"("stripePaymentIntentId");