ALTER TABLE "articles"
ADD COLUMN "published_snapshot" JSONB,
ADD COLUMN "published_slug" TEXT;

CREATE UNIQUE INDEX "articles_published_slug_key"
ON "articles"("published_slug");
