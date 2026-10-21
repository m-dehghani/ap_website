INSERT INTO "roles" ("name") VALUES ('SHOP_MANAGER') ON CONFLICT ("name") DO NOTHING;

CREATE TABLE "shop_products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "price" INTEGER NOT NULL,
    "salePrice" INTEGER,
    "saleStartsAt" TIMESTAMP(3),
    "saleEndsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isComingSoon" BOOLEAN NOT NULL DEFAULT false,
    "availableAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shop_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shop_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "size" TEXT,
    "color" TEXT,
    "priceOverride" INTEGER,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "shop_variants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shop_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "province" TEXT,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "shippingFee" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "authority" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    CONSTRAINT "shop_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shop_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "productName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "size" TEXT,
    "color" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "lineTotal" INTEGER NOT NULL,
    CONSTRAINT "shop_order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shop_reviews" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "mediaUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shop_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shop_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "shippingFee" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shop_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shop_products_slug_key" ON "shop_products"("slug");
CREATE INDEX "shop_products_isActive_featured_createdAt_idx" ON "shop_products"("isActive", "featured", "createdAt");
CREATE INDEX "shop_products_category_isActive_idx" ON "shop_products"("category", "isActive");
CREATE UNIQUE INDEX "shop_variants_sku_key" ON "shop_variants"("sku");
CREATE INDEX "shop_variants_productId_idx" ON "shop_variants"("productId");
CREATE UNIQUE INDEX "shop_orders_orderNumber_key" ON "shop_orders"("orderNumber");
CREATE UNIQUE INDEX "shop_orders_authority_key" ON "shop_orders"("authority");
CREATE INDEX "shop_orders_status_createdAt_idx" ON "shop_orders"("status", "createdAt");
CREATE INDEX "shop_orders_phone_createdAt_idx" ON "shop_orders"("phone", "createdAt");
CREATE INDEX "shop_order_items_productId_idx" ON "shop_order_items"("productId");
CREATE UNIQUE INDEX "shop_reviews_productId_userId_orderId_key" ON "shop_reviews"("productId", "userId", "orderId");
CREATE INDEX "shop_reviews_productId_isPublished_createdAt_idx" ON "shop_reviews"("productId", "isPublished", "createdAt");

ALTER TABLE "shop_variants" ADD CONSTRAINT "shop_variants_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "shop_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shop_orders" ADD CONSTRAINT "shop_orders_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shop_order_items" ADD CONSTRAINT "shop_order_items_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "shop_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shop_order_items" ADD CONSTRAINT "shop_order_items_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "shop_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shop_order_items" ADD CONSTRAINT "shop_order_items_variantId_fkey"
    FOREIGN KEY ("variantId") REFERENCES "shop_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shop_reviews" ADD CONSTRAINT "shop_reviews_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "shop_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shop_reviews" ADD CONSTRAINT "shop_reviews_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shop_reviews" ADD CONSTRAINT "shop_reviews_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "shop_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
