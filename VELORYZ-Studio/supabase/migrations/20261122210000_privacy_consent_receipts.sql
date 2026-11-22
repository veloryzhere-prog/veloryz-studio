-- VELORYZ privacy choices — pseudonymous receipts, owner-side only.
-- This does NOT collect raw IP, UA, user email, or browsing history.
CREATE TABLE IF NOT EXISTS veloryz_studio.studio_privacy_receipts (
 id uuid PRIMARY KEY,
 receipt_id uuid NOT NULL,
 policy_version text NOT NULL CHECK (char_length(policy_version)<=64),
 preferences boolean NOT NULL,
 analytics boolean NOT NULL,
 marketing boolean NOT NULL DEFAULT false,
 decision text NOT NULL CHECK (decision IN ('accept','reject','custom')),
 client_at timestamptz NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(receipt_id,client_at)
);
CREATE INDEX IF NOT EXISTS studio_privacy_receipts_recipient_time ON veloryz_studio.studio_privacy_receipts(receipt_id,recorded_at DESC);
ALTER TABLE veloryz_studio.studio_privacy_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON veloryz_studio.studio_privacy_receipts FROM PUBLIC,anon,authenticated;
-- The only registered SQL contract is restricted to same-origin privacy consent Edge endpoint.
INSERT INTO veloryz_studio.query_contracts(key,query)
VALUES (encode(sha256(convert_to($privacy$INSERT INTO veloryz_studio.studio_privacy_receipts (id,receipt_id,policy_version,preferences,analytics,marketing,decision,client_at,recorded_at) SELECT ?,?,?,?,?,?,?,?,? WHERE (SELECT count(*) FROM veloryz_studio.studio_privacy_receipts WHERE receipt_id=? AND recorded_at >= ?)<20 ON CONFLICT (receipt_id,client_at) DO NOTHING RETURNING id$privacy$,'UTF8')),'hex'),$privacy$INSERT INTO veloryz_studio.studio_privacy_receipts (id,receipt_id,policy_version,preferences,analytics,marketing,decision,client_at,recorded_at) SELECT ?,?,?,?,?,?,?,?,? WHERE (SELECT count(*) FROM veloryz_studio.studio_privacy_receipts WHERE receipt_id=? AND recorded_at >= ?)<20 ON CONFLICT (receipt_id,client_at) DO NOTHING RETURNING id$privacy$)
ON CONFLICT(key) DO NOTHING;
