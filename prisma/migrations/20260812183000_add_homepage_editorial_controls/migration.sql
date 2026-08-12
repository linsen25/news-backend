ALTER TABLE "articles"
ADD COLUMN "cover_focal_x" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN "cover_focal_y" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN "is_headline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "homepage_priority" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "articles_status_is_headline_homepage_priority_idx"
ON "articles"("status", "is_headline", "homepage_priority");
