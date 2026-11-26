CREATE TABLE IF NOT EXISTS veloryz_studio.studio_ai_client_archive (
 project_id text NOT NULL REFERENCES veloryz_studio.studio_client_projects(id) ON DELETE CASCADE,
 principal text NOT NULL CHECK (length(principal)=64),
 payload text NOT NULL CHECK (octet_length(payload)<=130000),
 version integer NOT NULL CHECK (version>=1),
 updated_at text NOT NULL,
 expires_at text NOT NULL,
 PRIMARY KEY(project_id,principal)
);
ALTER TABLE veloryz_studio.studio_ai_client_archive ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON veloryz_studio.studio_ai_client_archive FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON veloryz_studio.studio_ai_client_archive TO service_role;
INSERT INTO veloryz_studio.query_contracts(key,query) VALUES (encode(sha256(convert_to($contract$SELECT payload,version,updated_at FROM veloryz_studio.studio_ai_client_archive WHERE project_id=? AND principal=? AND expires_at>?$contract$,'UTF8')),'hex'),$contract$SELECT payload,version,updated_at FROM veloryz_studio.studio_ai_client_archive WHERE project_id=? AND principal=? AND expires_at>?$contract$) ON CONFLICT(key) DO UPDATE SET query=EXCLUDED.query;
INSERT INTO veloryz_studio.query_contracts(key,query) VALUES (encode(sha256(convert_to($contract$INSERT INTO veloryz_studio.studio_ai_client_archive (project_id,principal,payload,version,updated_at,expires_at) SELECT ?,?,?,1,?,? WHERE ?=0 OR EXISTS (SELECT 1 FROM veloryz_studio.studio_ai_client_archive WHERE project_id=? AND principal=? AND version=?) ON CONFLICT(project_id,principal) DO UPDATE SET payload=EXCLUDED.payload,version=studio_ai_client_archive.version+1,updated_at=EXCLUDED.updated_at,expires_at=EXCLUDED.expires_at WHERE studio_ai_client_archive.version=? RETURNING version$contract$,'UTF8')),'hex'),$contract$INSERT INTO veloryz_studio.studio_ai_client_archive (project_id,principal,payload,version,updated_at,expires_at) SELECT ?,?,?,1,?,? WHERE ?=0 OR EXISTS (SELECT 1 FROM veloryz_studio.studio_ai_client_archive WHERE project_id=? AND principal=? AND version=?) ON CONFLICT(project_id,principal) DO UPDATE SET payload=EXCLUDED.payload,version=studio_ai_client_archive.version+1,updated_at=EXCLUDED.updated_at,expires_at=EXCLUDED.expires_at WHERE studio_ai_client_archive.version=? RETURNING version$contract$) ON CONFLICT(key) DO UPDATE SET query=EXCLUDED.query;
INSERT INTO veloryz_studio.query_contracts(key,query) VALUES (encode(sha256(convert_to($contract$DELETE FROM veloryz_studio.studio_ai_client_archive WHERE project_id=? AND principal=? RETURNING version$contract$,'UTF8')),'hex'),$contract$DELETE FROM veloryz_studio.studio_ai_client_archive WHERE project_id=? AND principal=? RETURNING version$contract$) ON CONFLICT(key) DO UPDATE SET query=EXCLUDED.query;
