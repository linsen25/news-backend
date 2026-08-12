UPDATE "articles"
SET "summary" = '中加网持续关注事件进展，并为读者梳理相关背景、变化与影响。'
WHERE BTRIM("summary") = '';
