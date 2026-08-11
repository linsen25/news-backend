ALTER TABLE "articles"
ADD COLUMN "byline" TEXT NOT NULL DEFAULT '',
ADD COLUMN "article_date" TIMESTAMPTZ(3);

UPDATE "articles" AS article
SET "byline" = app_user."name"
FROM "users" AS app_user
WHERE app_user."id" = article."author_id"
  AND article."byline" = '';

UPDATE "articles"
SET "article_date" = COALESCE("published_at", "created_at")
WHERE "article_date" IS NULL;

ALTER TABLE "articles"
ALTER COLUMN "article_date" SET NOT NULL,
ALTER COLUMN "article_date" SET DEFAULT CURRENT_TIMESTAMP;
