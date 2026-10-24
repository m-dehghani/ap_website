-- CreateTable
CREATE TABLE "page_contents" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_contents_page_section_key" ON "page_contents"("page", "section");

-- AlterTable
ALTER TABLE "academy_info" ADD COLUMN "domain" TEXT;

-- AlterTable
ALTER TABLE "coaches" ALTER COLUMN "password" DROP DEFAULT;