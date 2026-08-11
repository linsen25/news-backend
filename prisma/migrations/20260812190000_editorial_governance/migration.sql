ALTER TABLE "articles" ADD COLUMN "withdrawal_reason" TEXT;
ALTER TABLE "articles" ADD COLUMN "withdrawn_at" TIMESTAMPTZ(3);
ALTER TABLE "article_revisions" ADD COLUMN "article_snapshot" JSONB;

INSERT INTO "permissions" ("id", "key", "module", "description", "created_at")
VALUES ('perm-withdraw', 'articles.withdraw', 'articles.review', '撤下已经公开的文章', NOW())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id", "created_at")
SELECT 'role-admin', "id", NOW() FROM "permissions" WHERE "key" = 'articles.withdraw'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
