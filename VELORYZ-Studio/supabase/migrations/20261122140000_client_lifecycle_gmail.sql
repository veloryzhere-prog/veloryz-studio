-- VELORYZ lifecycle automation: accepted enquiry -> private client workspace
-- Additive, non-destructive. Keep all records private; the public browser uses
-- only the separately authenticated Edge Functions.
ALTER TABLE veloryz_studio.studio_client_projects
 ADD COLUMN IF NOT EXISTS enquiry_id text,
 ADD COLUMN IF NOT EXISTS request_reference text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS brief_details text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS accepted_at text NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS studio_client_projects_one_per_enquiry
 ON veloryz_studio.studio_client_projects(enquiry_id) WHERE enquiry_id IS NOT NULL;
ALTER TABLE veloryz_studio.studio_enquiries
 ADD COLUMN IF NOT EXISTS acceptance_status text NOT NULL DEFAULT 'pending',
 ADD COLUMN IF NOT EXISTS accepted_project_id text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS accepted_at text NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS studio_enquiries_acceptance_queue
 ON veloryz_studio.studio_enquiries(acceptance_status,created_at DESC);
ALTER TABLE veloryz_studio.studio_client_messages
 ADD COLUMN IF NOT EXISTS read_at text NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS studio_client_messages_unread
 ON veloryz_studio.studio_client_messages(project_id,sender,read_at,created_at);
CREATE TABLE IF NOT EXISTS veloryz_studio.studio_client_email_events (
 id text PRIMARY KEY,
 project_id text NOT NULL REFERENCES veloryz_studio.studio_client_projects(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK (kind IN ('acceptance','invitation','client-message','studio-message')),
 recipient text NOT NULL,
 sender text NOT NULL DEFAULT 'veloryz.here@gmail.com',
 transport text NOT NULL DEFAULT 'gmail-smtp-465',
 state text NOT NULL CHECK (state IN ('pending','sent','not-configured','failed')),
 provider_message_id text NOT NULL DEFAULT '',
 error_label text NOT NULL DEFAULT '',
 created_at text NOT NULL,
 updated_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS studio_client_email_events_project
 ON veloryz_studio.studio_client_email_events(project_id,created_at DESC);
ALTER TABLE veloryz_studio.studio_client_email_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE veloryz_studio.studio_client_email_events FROM PUBLIC,anon,authenticated;
-- Service-role SQL runs in the protected client portal function; client
-- and owner browsers do not receive direct table credentials or raw SQL access.
