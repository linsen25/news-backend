ALTER TABLE "articles"
ADD COLUMN "view_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "last_viewed_at" TIMESTAMPTZ(3);

CREATE TABLE "article_views" (
  "id" TEXT NOT NULL,
  "article_id" TEXT NOT NULL,
  "visitor_id" TEXT NOT NULL,
  "viewed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "article_views_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "article_views_article_id_viewed_at_idx" ON "article_views"("article_id", "viewed_at");
CREATE INDEX "article_views_article_id_visitor_id_viewed_at_idx" ON "article_views"("article_id", "visitor_id", "viewed_at");

ALTER TABLE "article_views"
ADD CONSTRAINT "article_views_article_id_fkey"
FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
