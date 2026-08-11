INSERT INTO "categories" ("id", "name", "slug", "parent_id", "created_at", "updated_at") VALUES
  ('cat-ca', '加拿大', 'canada', NULL, NOW(), NOW()),
  ('cat-world', '国际', 'world', NULL, NOW(), NOW()),
  ('cat-tech', '科技', 'technology', NULL, NOW(), NOW()),
  ('cat-business', '财经', 'business', NULL, NOW(), NOW()),
  ('cat-society', '社会', 'society', NULL, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "slug" = EXCLUDED."slug", "parent_id" = NULL, "updated_at" = NOW();

INSERT INTO "tags" ("id", "name", "slug", "category_id", "created_at", "updated_at") VALUES
  ('tag-immigration', '移民政策', 'immigration-policy', 'cat-ca', NOW(), NOW()),
  ('tag-education', '留学教育', 'study-education', 'cat-ca', NOW(), NOW()),
  ('tag-global', '全球观察', 'global-watch', 'cat-world', NOW(), NOW()),
  ('tag-diplomacy', '外交动态', 'diplomacy', 'cat-world', NOW(), NOW()),
  ('tag-openai', '人工智能', 'artificial-intelligence', 'cat-tech', NOW(), NOW()),
  ('tag-digital', '数字产业', 'digital-industry', 'cat-tech', NOW(), NOW()),
  ('tag-market', '市场趋势', 'market-trends', 'cat-business', NOW(), NOW()),
  ('tag-enterprise', '企业创新', 'enterprise-innovation', 'cat-business', NOW(), NOW()),
  ('tag-community', '华人社区', 'chinese-community', 'cat-society', NOW(), NOW()),
  ('tag-city', '城市生活', 'city-life', 'cat-society', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "slug" = EXCLUDED."slug", "category_id" = EXCLUDED."category_id", "updated_at" = NOW();
