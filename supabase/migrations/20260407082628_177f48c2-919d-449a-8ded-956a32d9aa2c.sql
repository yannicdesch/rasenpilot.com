
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS redirect_to TEXT DEFAULT NULL;

WITH ranked AS (
  SELECT id, slug,
    SUBSTRING(title FROM 1 FOR POSITION(':' IN title || ':') - 1) as topic,
    LENGTH(COALESCE(content, '')) as content_length,
    ROW_NUMBER() OVER (
      PARTITION BY SUBSTRING(title FROM 1 FOR POSITION(':' IN title || ':') - 1)
      ORDER BY LENGTH(COALESCE(content, '')) DESC, date DESC
    ) as rn,
    COUNT(*) OVER (
      PARTITION BY SUBSTRING(title FROM 1 FOR POSITION(':' IN title || ':') - 1)
    ) as group_size
  FROM blog_posts
  WHERE status = 'published'
),
keepers AS (
  SELECT topic, slug as keeper_slug
  FROM ranked
  WHERE rn = 1 AND group_size > 1
),
to_redirect AS (
  SELECT r.id, r.slug, k.keeper_slug
  FROM ranked r
  JOIN keepers k ON k.topic = r.topic
  WHERE r.rn > 1
)
UPDATE blog_posts
SET status = 'redirect',
    redirect_to = tr.keeper_slug,
    updated_at = NOW()
FROM to_redirect tr
WHERE blog_posts.id = tr.id;
