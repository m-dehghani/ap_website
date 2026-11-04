ALTER TABLE "payments"
ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'ZARINPAL';

ALTER TABLE "shop_orders"
ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'ZARINPAL';

ALTER TABLE "shop_orders"
RENAME COLUMN "authority" TO "providerReference";

ALTER INDEX "shop_orders_authority_key"
RENAME TO "shop_orders_providerReference_key";

CREATE INDEX "payments_providerReference_provider_idx"
ON "payments"("providerReference", "provider");

CREATE INDEX "shop_orders_provider_status_idx"
ON "shop_orders"("provider", "status");

CREATE TABLE "payment_gateway_configs" (
    "provider" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "encryptedCredential" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_gateway_configs_pkey" PRIMARY KEY ("provider")
);

CREATE UNIQUE INDEX "payment_gateway_configs_one_default_idx"
ON "payment_gateway_configs"("isDefault")
WHERE "isDefault" = true;
