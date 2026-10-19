-- Add stripeSessionId column to registrations table
ALTER TABLE "registrations" ADD COLUMN "stripeSessionId" TEXT;

-- Create unique index for stripeSessionId
CREATE UNIQUE INDEX "registrations_stripeSessionId_key" ON "registrations"("stripeSessionId");