-- R50 protected deliverables and transactional approvals.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('veloryz-client-deliverables','veloryz-client-deliverables',false,2097152,ARRAY['application/pdf','image/png','image/jpeg','text/plain'])
ON CONFLICT(id) DO NOTHING;
CREATE POLICY r50_client_files_private_objects ON storage.objects AS RESTRICTIVE FOR ALL TO anon,authenticated
USING (bucket_id <> 'veloryz-client-deliverables') WITH CHECK (bucket_id <> 'veloryz-client-deliverables');
CREATE TABLE veloryz_studio.studio_client_files (
 id text PRIMARY KEY REFERENCES veloryz_studio.studio_client_items(id) ON DELETE CASCADE,
 project_id text NOT NULL REFERENCES veloryz_studio.studio_client_projects(id) ON DELETE CASCADE,
 filename text NOT NULL CHECK (length(filename) BETWEEN 1 AND 160),
 mime text NOT NULL CHECK (mime IN ('application/pdf','image/png','image/jpeg','text/plain')),
 size integer NOT NULL CHECK (size BETWEEN 1 AND 2097152),
 object_key text NOT NULL UNIQUE,
 created_at text NOT NULL
);
ALTER TABLE veloryz_studio.studio_client_files ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON veloryz_studio.studio_client_files FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,DELETE ON veloryz_studio.studio_client_files TO service_role;
CREATE FUNCTION veloryz_studio.r50_record_decision(p_project text,p_item text,p_state text,p_message_id text,p_message text,p_now text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $fn$
BEGIN
 IF p_state NOT IN ('approved','changes') THEN RETURN false; END IF;
 UPDATE veloryz_studio.studio_client_items SET state=p_state,updated_at=p_now
 WHERE id=p_item AND project_id=p_project AND type='approval' AND state='waiting';
 IF NOT FOUND THEN RETURN false; END IF;
 INSERT INTO veloryz_studio.studio_client_messages(id,project_id,sender,body,created_at)
 VALUES(p_message_id,p_project,'client',p_message,p_now);
 RETURN true;
END;
$fn$;
REVOKE ALL ON FUNCTION veloryz_studio.r50_record_decision(text,text,text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION veloryz_studio.r50_record_decision(text,text,text,text,text,text) TO service_role;
INSERT INTO veloryz_studio.query_contracts(key,query) VALUES (encode(sha256(convert_to($contract$INSERT INTO veloryz_studio.studio_client_files (id,project_id,filename,mime,size,object_key,created_at) VALUES (?,?,?,?,?,?,?) RETURNING id$contract$,'UTF8')),'hex'),$contract$INSERT INTO veloryz_studio.studio_client_files (id,project_id,filename,mime,size,object_key,created_at) VALUES (?,?,?,?,?,?,?) RETURNING id$contract$) ON CONFLICT(key) DO UPDATE SET query=EXCLUDED.query;
INSERT INTO veloryz_studio.query_contracts(key,query) VALUES (encode(sha256(convert_to($contract$SELECT id,project_id,filename,mime,size,object_key,created_at FROM veloryz_studio.studio_client_files WHERE id=? AND project_id=?$contract$,'UTF8')),'hex'),$contract$SELECT id,project_id,filename,mime,size,object_key,created_at FROM veloryz_studio.studio_client_files WHERE id=? AND project_id=?$contract$) ON CONFLICT(key) DO UPDATE SET query=EXCLUDED.query;
INSERT INTO veloryz_studio.query_contracts(key,query) VALUES (encode(sha256(convert_to($contract$SELECT count(*) AS count FROM veloryz_studio.studio_client_files WHERE project_id=?$contract$,'UTF8')),'hex'),$contract$SELECT count(*) AS count FROM veloryz_studio.studio_client_files WHERE project_id=?$contract$) ON CONFLICT(key) DO UPDATE SET query=EXCLUDED.query;
INSERT INTO veloryz_studio.query_contracts(key,query) VALUES (encode(sha256(convert_to($contract$SELECT veloryz_studio.r50_record_decision(?,?,?,?,?,?) AS accepted$contract$,'UTF8')),'hex'),$contract$SELECT veloryz_studio.r50_record_decision(?,?,?,?,?,?) AS accepted$contract$) ON CONFLICT(key) DO UPDATE SET query=EXCLUDED.query;
