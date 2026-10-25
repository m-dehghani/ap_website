-- CreateTable
CREATE TABLE "hero_contents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "ctaHref" TEXT NOT NULL,
    "ctaSecondaryLabel" TEXT NOT NULL,
    "ctaSecondaryHref" TEXT NOT NULL,
    "bgGradient" TEXT NOT NULL,
    "stats" JSONB NOT NULL,
    "statLabels" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_achievements" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "bg" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features_contents" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL,
    "iconColor" TEXT NOT NULL,
    "stats" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_stat_items" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_stat_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cta_contents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primaryCTALabel" TEXT NOT NULL,
    "primaryCTAHref" TEXT NOT NULL,
    "secondaryCTALabel" TEXT NOT NULL,
    "secondaryCTAHref" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cta_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_contents" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "about_contents_section_key" ON "about_contents"("section");
