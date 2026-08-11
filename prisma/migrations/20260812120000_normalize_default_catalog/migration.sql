UPDATE "articles" SET "category_id" = 'cat-society' WHERE "category_id" = 'cat-news';
UPDATE "articles" SET "category_id" = 'cat-world' WHERE "category_id" = 'cat-us';
UPDATE "articles" SET "category_id" = 'cat-tech' WHERE "category_id" IN ('cat-ai', 'cat-software');

INSERT INTO "article_tags" ("article_id", "tag_id", "created_at")
SELECT "article_id", 'tag-digital', "created_at" FROM "article_tags" WHERE "tag_id" = 'tag-chatgpt'
ON CONFLICT ("article_id", "tag_id") DO NOTHING;
INSERT INTO "article_tags" ("article_id", "tag_id", "created_at")
SELECT "article_id", 'tag-immigration', "created_at" FROM "article_tags" WHERE "tag_id" = 'tag-canada'
ON CONFLICT ("article_id", "tag_id") DO NOTHING;
INSERT INTO "article_tags" ("article_id", "tag_id", "created_at")
SELECT "article_id", 'tag-education', "created_at" FROM "article_tags" WHERE "tag_id" = 'tag-policy'
ON CONFLICT ("article_id", "tag_id") DO NOTHING;

DELETE FROM "article_tags" WHERE "tag_id" IN ('tag-chatgpt', 'tag-canada', 'tag-policy');
DELETE FROM "tags" WHERE "id" IN ('tag-chatgpt', 'tag-canada', 'tag-policy');
DELETE FROM "categories" WHERE "id" IN ('cat-news', 'cat-us', 'cat-ai', 'cat-software');
