-- Remove stripeSessionId column from registrations table
ALTER TABLE "registrations" DROP COLUMN IF EXISTS "stripeSessionId";

-- Remove stripePaymentIntentId and stripeSessionId columns from payments table
ALTER TABLE "payments" DROP COLUMN IF EXISTS "stripePaymentIntentId";
ALTER TABLE "payments" DROP COLUMN IF EXISTS "stripeSessionId";

-- Drop unique index for stripePaymentIntentId if exists
DROP INDEX IF EXISTS "payments_stripePaymentIntentId_key";

-- Drop unique index for stripeSessionId if exists
DROP INDEX IF EXISTS "registrations_stripeSessionId_key";