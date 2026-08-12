UPDATE "articles"
SET "published_snapshot" = jsonb_set(
  "published_snapshot",
  '{summary}',
  to_jsonb("summary"),
  true
)
WHERE "published_snapshot" IS NOT NULL
  AND BTRIM(COALESCE("published_snapshot"->>'summary', '')) = '';
