ALTER TABLE "tags" ADD COLUMN "category_id" TEXT;

CREATE INDEX "tags_category_id_idx" ON "tags"("category_id");

ALTER TABLE "tags"
ADD CONSTRAINT "tags_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "categories"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
