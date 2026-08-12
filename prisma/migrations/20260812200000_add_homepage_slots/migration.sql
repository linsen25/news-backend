CREATE TABLE "homepage_slots" (
  "id" TEXT NOT NULL,
  "section" TEXT NOT NULL,
  "scope" TEXT NOT NULL DEFAULT 'global',
  "position" INTEGER NOT NULL,
  "article_id" TEXT NOT NULL,
  "starts_at" TIMESTAMPTZ(3),
  "ends_at" TIMESTAMPTZ(3),
  "created_by_id" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "homepage_slots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "homepage_slots_section_scope_position_key" ON "homepage_slots"("section", "scope", "position");
CREATE UNIQUE INDEX "homepage_slots_section_scope_article_id_key" ON "homepage_slots"("section", "scope", "article_id");
CREATE INDEX "homepage_slots_starts_at_ends_at_idx" ON "homepage_slots"("starts_at", "ends_at");
ALTER TABLE "homepage_slots" ADD CONSTRAINT "homepage_slots_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "homepage_slots" ADD CONSTRAINT "homepage_slots_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "permissions" ("id", "key", "module", "description", "created_at") VALUES
('perm-homepage-view', 'homepage.view', 'homepage.manage', '查看首页编排', NOW()),
('perm-homepage-manage', 'homepage.manage', 'homepage.manage', '管理首页编排', NOW())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id", "created_at")
SELECT r."id", p."id", NOW()
FROM "roles" r CROSS JOIN "permissions" p
WHERE p."key" = 'homepage.view' AND r."name" IN ('Author', 'Reviewer', 'Admin')
ON CONFLICT DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id", "created_at")
SELECT r."id", p."id", NOW()
FROM "roles" r CROSS JOIN "permissions" p
WHERE p."key" = 'homepage.manage' AND r."name" = 'Admin'
ON CONFLICT DO NOTHING;
