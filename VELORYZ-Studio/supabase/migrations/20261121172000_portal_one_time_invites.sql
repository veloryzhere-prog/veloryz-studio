-- Atomic consumption stops invitation code reuse. Every client receives their own random invitation.
INSERT INTO veloryz_studio.query_contracts(key,query)
SELECT encode(sha256(convert_to(q,'UTF8')),'hex'),q
FROM (VALUES ($vzc$UPDATE veloryz_studio.studio_client_invites SET revoked_at=? WHERE token_hash=? AND revoked_at='' AND expires_at>? RETURNING project_id$vzc$)) AS contracts(q)
ON CONFLICT(key) DO UPDATE SET query=EXCLUDED.query;
