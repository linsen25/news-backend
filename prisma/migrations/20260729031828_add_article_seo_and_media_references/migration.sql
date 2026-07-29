-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "meta_description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "meta_title" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "article_media" (
    "article_id" TEXT NOT NULL,
    "media_asset_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_media_pkey" PRIMARY KEY ("article_id","media_asset_id")
);

-- CreateIndex
CREATE INDEX "article_media_media_asset_id_idx" ON "article_media"("media_asset_id");

-- AddForeignKey
ALTER TABLE "article_media" ADD CONSTRAINT "article_media_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_media" ADD CONSTRAINT "article_media_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
