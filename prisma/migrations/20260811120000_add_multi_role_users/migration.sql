CREATE TABLE "user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id")
);

CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

INSERT INTO "user_roles" ("user_id", "role_id")
SELECT "id", "role_id" FROM "users";

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey"
FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";
DROP INDEX "users_role_id_idx";
ALTER TABLE "users" DROP COLUMN "role_id";

INSERT INTO "permissions" ("id", "key", "module", "description") VALUES
('perm-media-view', 'media.view', 'media.manage', '查看媒体库'),
('perm-media-upload', 'media.upload', 'media.manage', '上传媒体'),
('perm-media-delete', 'media.delete', 'media.manage', '删除自己的媒体')
ON CONFLICT ("id") DO UPDATE SET
"key" = EXCLUDED."key", "module" = EXCLUDED."module", "description" = EXCLUDED."description";

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT assignments.role_id, assignments.permission_id
FROM (VALUES
  ('role-author', 'perm-review-view'),
  ('role-author', 'perm-users-view'),
  ('role-author', 'perm-media-view'),
  ('role-author', 'perm-media-upload'),
  ('role-author', 'perm-media-delete'),
  ('role-reviewer', 'perm-users-view'),
  ('role-reviewer', 'perm-media-view'),
  ('role-admin', 'perm-media-view'),
  ('role-admin', 'perm-media-upload'),
  ('role-admin', 'perm-media-delete')
) AS assignments(role_id, permission_id)
JOIN "roles" ON "roles"."id" = assignments.role_id
JOIN "permissions" ON "permissions"."id" = assignments.permission_id
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
