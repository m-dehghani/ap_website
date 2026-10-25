CREATE TABLE "provinces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "shippingFee" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "provinceId" TEXT NOT NULL,
    "shippingFee" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "provinces_name_key" ON "provinces"("name");
CREATE UNIQUE INDEX "cities_provinceId_name_key" ON "cities"("provinceId", "name");

ALTER TABLE "cities" ADD CONSTRAINT "cities_provinceId_fkey"
    FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
