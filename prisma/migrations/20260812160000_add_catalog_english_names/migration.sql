ALTER TABLE "categories" ADD COLUMN "name_en" TEXT NOT NULL DEFAULT '';
ALTER TABLE "tags" ADD COLUMN "name_en" TEXT NOT NULL DEFAULT '';

UPDATE "categories" SET "name_en" = CASE "id"
  WHEN 'cat-ca' THEN 'Canada'
  WHEN 'cat-world' THEN 'International'
  WHEN 'cat-tech' THEN 'Technology'
  WHEN 'cat-business' THEN 'Business'
  WHEN 'cat-society' THEN 'Society'
  ELSE "name_en"
END;

UPDATE "tags" SET "name_en" = CASE "id"
  WHEN 'tag-immigration' THEN 'Immigration Policy'
  WHEN 'tag-education' THEN 'International Education'
  WHEN 'tag-global' THEN 'Global Affairs'
  WHEN 'tag-diplomacy' THEN 'Diplomacy'
  WHEN 'tag-openai' THEN 'Artificial Intelligence'
  WHEN 'tag-digital' THEN 'Digital Economy'
  WHEN 'tag-market' THEN 'Market Trends'
  WHEN 'tag-enterprise' THEN 'Business Innovation'
  WHEN 'tag-community' THEN 'Chinese Community'
  WHEN 'tag-city' THEN 'City Life'
  ELSE "name_en"
END;
