-- Extend the existing moderated review store; no anonymous database grants.
ALTER TABLE veloryz_studio.studio_reviews
 ADD COLUMN IF NOT EXISTS headline text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS service text NOT NULL DEFAULT 'Other',
 ADD COLUMN IF NOT EXISTS highlights text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS improvement text NOT NULL DEFAULT '';
DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='studio_reviews_detail_limits') THEN
  ALTER TABLE veloryz_studio.studio_reviews
  ADD CONSTRAINT studio_reviews_detail_limits CHECK (
   char_length(headline)<=90 AND char_length(service)<=45 AND
   char_length(highlights)<=300 AND char_length(improvement)<=300
  );
 END IF;
END $$;
ALTER TABLE veloryz_studio.studio_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON veloryz_studio.studio_reviews FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON veloryz_studio.studio_reviews TO service_role;
-- Fixed SQL contracts are SHA-256 addressed and accessible through service-role-only RPC.
INSERT INTO veloryz_studio.query_contracts(key,query)
SELECT encode(sha256(convert_to(statement,'UTF8')),'hex'),statement
FROM (VALUES
 ($sql$SELECT id,display_name,rating,body,headline,service,highlights,improvement,created_at FROM veloryz_studio.studio_reviews WHERE status='approved' ORDER BY created_at DESC LIMIT 60$sql$),
 ($sql$SELECT count(*)::integer AS total,COALESCE(round(avg(rating)::numeric,1),0)::numeric AS average FROM veloryz_studio.studio_reviews WHERE status='approved'$sql$),
 ($sql$SELECT rating,count(*)::integer AS count FROM veloryz_studio.studio_reviews WHERE status='approved' GROUP BY rating ORDER BY rating DESC$sql$),
 ($sql$INSERT INTO veloryz_studio.studio_reviews (id,display_name,rating,body,status,headline,service,highlights,improvement,created_at) VALUES (?,?,?,?,'pending',?,?,?,?,now()) RETURNING id$sql$),
 ($sql$SELECT id,display_name,rating,body,headline,service,highlights,improvement,status,created_at,moderated_at FROM veloryz_studio.studio_reviews ORDER BY created_at DESC LIMIT 150$sql$)
) AS contracts(statement)
ON CONFLICT(key) DO UPDATE SET query=EXCLUDED.query;
