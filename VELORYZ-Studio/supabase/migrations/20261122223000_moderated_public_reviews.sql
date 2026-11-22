-- VELORYZ review platform. Public cannot query or mutate this table directly.
CREATE TABLE IF NOT EXISTS veloryz_studio.studio_reviews (
  id uuid PRIMARY KEY,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 60),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL CHECK (char_length(body) BETWEEN 25 AND 800),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  moderated_at timestamptz
);
ALTER TABLE veloryz_studio.studio_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE veloryz_studio.studio_reviews FROM PUBLIC, anon, authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE veloryz_studio.studio_reviews TO service_role;
CREATE INDEX IF NOT EXISTS studio_reviews_approved_created
  ON veloryz_studio.studio_reviews (created_at DESC) WHERE status='approved';
CREATE INDEX IF NOT EXISTS studio_reviews_pending_created
  ON veloryz_studio.studio_reviews (created_at DESC) WHERE status='pending';
-- Register only fixed SQL templates in the existing service-role-only RPC.
INSERT INTO veloryz_studio.query_contracts (key,query)
SELECT encode(sha256(convert_to(statement,'UTF8')),'hex'), statement
FROM (VALUES
  ($sql$SELECT id,display_name,rating,body,created_at FROM veloryz_studio.studio_reviews WHERE status='approved' ORDER BY created_at DESC LIMIT 36$sql$),
  ($sql$SELECT count(*)::integer AS total,COALESCE(round(avg(rating)::numeric,1),0)::numeric AS average FROM veloryz_studio.studio_reviews WHERE status='approved'$sql$),
  ($sql$INSERT INTO veloryz_studio.studio_reviews (id,display_name,rating,body,status,created_at) VALUES (?,?,?,?,'pending',now()) RETURNING id$sql$),
  ($sql$SELECT id,display_name,rating,body,status,created_at,moderated_at FROM veloryz_studio.studio_reviews ORDER BY created_at DESC LIMIT 100$sql$),
  ($sql$UPDATE veloryz_studio.studio_reviews SET status=?,moderated_at=now() WHERE id=? RETURNING id,status$sql$),
  ($sql$INSERT INTO veloryz_studio.studio_limits (id,count,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=studio_limits.count+1 RETURNING count$sql$)
) AS contracts(statement)
ON CONFLICT (key) DO UPDATE SET query=EXCLUDED.query;
