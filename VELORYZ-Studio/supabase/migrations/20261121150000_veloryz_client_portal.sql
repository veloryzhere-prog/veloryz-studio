-- Dedicated VELORYZ client room in the existing isolated studio schema.
CREATE TABLE IF NOT EXISTS veloryz_studio.studio_client_projects(
 id text PRIMARY KEY,client_name text NOT NULL,client_email text NOT NULL,title text NOT NULL,
 summary text NOT NULL DEFAULT '',status text NOT NULL DEFAULT 'planning',
 phase text NOT NULL DEFAULT 'Discover',progress integer NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
 due_date text NOT NULL DEFAULT '',next_step text NOT NULL DEFAULT '',
 created_at text NOT NULL,updated_at text NOT NULL
);
CREATE TABLE IF NOT EXISTS veloryz_studio.studio_client_items(
 id text PRIMARY KEY,
 project_id text NOT NULL REFERENCES veloryz_studio.studio_client_projects(id) ON DELETE CASCADE,
 type text NOT NULL CHECK(type IN ('milestone','file','approval')),title text NOT NULL,details text NOT NULL DEFAULT '',
 state text NOT NULL DEFAULT 'upcoming',due_date text NOT NULL DEFAULT '',url text NOT NULL DEFAULT '',
 created_at text NOT NULL,updated_at text NOT NULL
);
CREATE TABLE IF NOT EXISTS veloryz_studio.studio_client_messages(
 id text PRIMARY KEY,project_id text NOT NULL REFERENCES veloryz_studio.studio_client_projects(id) ON DELETE CASCADE,
 sender text NOT NULL CHECK(sender IN ('studio','client')),body text NOT NULL,created_at text NOT NULL
);
CREATE TABLE IF NOT EXISTS veloryz_studio.studio_client_invites(
 id text PRIMARY KEY,project_id text NOT NULL REFERENCES veloryz_studio.studio_client_projects(id) ON DELETE CASCADE,
 token_hash text NOT NULL UNIQUE,expires_at text NOT NULL,revoked_at text NOT NULL DEFAULT '',created_at text NOT NULL
);
CREATE TABLE IF NOT EXISTS veloryz_studio.studio_client_sessions(
 id text PRIMARY KEY,project_id text NOT NULL REFERENCES veloryz_studio.studio_client_projects(id) ON DELETE CASCADE,
 token_hash text NOT NULL UNIQUE,expires_at text NOT NULL,revoked_at text NOT NULL DEFAULT '',created_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS studio_client_items_project_idx ON veloryz_studio.studio_client_items(project_id);
CREATE INDEX IF NOT EXISTS studio_client_messages_project_idx ON veloryz_studio.studio_client_messages(project_id,created_at);
CREATE INDEX IF NOT EXISTS studio_client_invites_project_idx ON veloryz_studio.studio_client_invites(project_id);
CREATE INDEX IF NOT EXISTS studio_client_sessions_project_idx ON veloryz_studio.studio_client_sessions(project_id);
ALTER TABLE veloryz_studio.studio_client_projects ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON veloryz_studio.studio_client_projects FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON veloryz_studio.studio_client_projects TO service_role;
ALTER TABLE veloryz_studio.studio_client_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON veloryz_studio.studio_client_items FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON veloryz_studio.studio_client_items TO service_role;
ALTER TABLE veloryz_studio.studio_client_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON veloryz_studio.studio_client_messages FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON veloryz_studio.studio_client_messages TO service_role;
ALTER TABLE veloryz_studio.studio_client_invites ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON veloryz_studio.studio_client_invites FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON veloryz_studio.studio_client_invites TO service_role;
ALTER TABLE veloryz_studio.studio_client_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON veloryz_studio.studio_client_sessions FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON veloryz_studio.studio_client_sessions TO service_role;
INSERT INTO veloryz_studio.query_contracts(key,query)
SELECT encode(sha256(convert_to(q,'UTF8')),'hex'),q FROM (VALUES
 ($portal$SELECT id,client_name,client_email,title,summary,status,phase,progress,due_date,next_step,created_at,updated_at FROM veloryz_studio.studio_client_projects ORDER BY updated_at DESC LIMIT 100$portal$), -- listProjects
 ($portal$SELECT id,client_name,client_email,title,summary,status,phase,progress,due_date,next_step,created_at,updated_at FROM veloryz_studio.studio_client_projects WHERE id=?$portal$), -- getProject
 ($portal$INSERT INTO veloryz_studio.studio_client_projects (id,client_name,client_email,title,summary,status,phase,progress,due_date,next_step,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id$portal$), -- addProject
 ($portal$UPDATE veloryz_studio.studio_client_projects SET client_name=?,client_email=?,title=?,summary=?,status=?,phase=?,progress=?,due_date=?,next_step=?,updated_at=? WHERE id=? RETURNING id$portal$), -- editProject
 ($portal$SELECT id,project_id,type,title,details,state,due_date,url,created_at,updated_at FROM veloryz_studio.studio_client_items WHERE project_id=? ORDER BY created_at ASC LIMIT 150$portal$), -- listItems
 ($portal$INSERT INTO veloryz_studio.studio_client_items (id,project_id,type,title,details,state,due_date,url,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) RETURNING id$portal$), -- addItem
 ($portal$UPDATE veloryz_studio.studio_client_items SET title=?,details=?,state=?,due_date=?,url=?,updated_at=? WHERE id=? AND project_id=? RETURNING id$portal$), -- editItem
 ($portal$DELETE FROM veloryz_studio.studio_client_items WHERE id=? AND project_id=? RETURNING id$portal$), -- deleteItem
 ($portal$SELECT id,project_id,sender,body,created_at FROM veloryz_studio.studio_client_messages WHERE project_id=? ORDER BY created_at DESC LIMIT 100$portal$), -- listMessages
 ($portal$INSERT INTO veloryz_studio.studio_client_messages (id,project_id,sender,body,created_at) VALUES (?,?,?,?,?) RETURNING id$portal$), -- addMessage
 ($portal$UPDATE veloryz_studio.studio_client_invites SET revoked_at=? WHERE project_id=? AND revoked_at=''$portal$), -- revokeInvites
 ($portal$UPDATE veloryz_studio.studio_client_sessions SET revoked_at=? WHERE project_id=? AND revoked_at=''$portal$), -- revokeSessionsByProject
 ($portal$INSERT INTO veloryz_studio.studio_client_invites (id,project_id,token_hash,expires_at,revoked_at,created_at) VALUES (?,?,?,?,?,?) RETURNING id$portal$), -- addInvite
 ($portal$SELECT project_id FROM veloryz_studio.studio_client_invites WHERE token_hash=? AND revoked_at='' AND expires_at>?$portal$), -- verifyInvite
 ($portal$INSERT INTO veloryz_studio.studio_client_sessions (id,project_id,token_hash,expires_at,revoked_at,created_at) VALUES (?,?,?,?,?,?) RETURNING id$portal$), -- addSession
 ($portal$SELECT project_id FROM veloryz_studio.studio_client_sessions WHERE token_hash=? AND revoked_at='' AND expires_at>?$portal$), -- verifySession
 ($portal$UPDATE veloryz_studio.studio_client_sessions SET revoked_at=? WHERE token_hash=?$portal$), -- revokeSession
 ($portal$UPDATE veloryz_studio.studio_client_items SET state=?,updated_at=? WHERE id=? AND project_id=? AND type='approval' AND state='waiting' RETURNING id$portal$)
) AS contracts(q)
ON CONFLICT(key) DO UPDATE SET query=EXCLUDED.query;
