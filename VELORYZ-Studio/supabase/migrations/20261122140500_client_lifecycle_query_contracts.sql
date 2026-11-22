-- Canonical contracts for dedicated client-lifecycle API.
-- SQL templates are looked up by SHA-256; client code never supplies raw SQL.
INSERT INTO veloryz_studio.query_contracts (key, query)
SELECT encode(sha256(convert_to(v.query,'UTF8')),'hex'),v.query
FROM (VALUES
($query_0$SELECT id,reference,name,email,phone,service,budget,preferred_date,preferred_time,company,message,status,acceptance_status,accepted_project_id,accepted_at,created_at FROM veloryz_studio.studio_enquiries WHERE id=?$query_0$),
($query_1$SELECT id,client_name,client_email,title,summary,status,phase,progress,due_date,next_step,created_at,updated_at,enquiry_id,request_reference,brief_details,accepted_at FROM veloryz_studio.studio_client_projects WHERE enquiry_id=?$query_1$),
($query_2$INSERT INTO veloryz_studio.studio_client_projects (id,client_name,client_email,title,summary,status,phase,progress,due_date,next_step,created_at,updated_at,enquiry_id,request_reference,brief_details,accepted_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT (enquiry_id) WHERE enquiry_id IS NOT NULL DO NOTHING RETURNING id$query_2$),
($query_3$UPDATE veloryz_studio.studio_enquiries SET acceptance_status='accepted',accepted_project_id=(SELECT id FROM veloryz_studio.studio_client_projects WHERE enquiry_id=?),accepted_at=CASE WHEN accepted_at='' THEN ? ELSE accepted_at END,status=CASE WHEN status='new' THEN 'contacted' ELSE status END,updated_at=? WHERE id=? RETURNING id,accepted_project_id$query_3$),
($query_4$INSERT INTO veloryz_studio.studio_client_items (id,project_id,type,title,details,state,due_date,url,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT (id) DO NOTHING RETURNING id$query_4$),
($query_5$INSERT INTO veloryz_studio.studio_client_email_events (id,project_id,kind,recipient,sender,transport,state,provider_message_id,error_label,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) RETURNING id$query_5$),
($query_6$SELECT id,kind,recipient,sender,transport,state,error_label,created_at FROM veloryz_studio.studio_client_email_events WHERE project_id=? ORDER BY created_at DESC LIMIT 35$query_6$),
($query_7$UPDATE veloryz_studio.studio_client_messages SET read_at=? WHERE project_id=? AND sender=? AND read_at='' RETURNING id$query_7$),
($query_8$SELECT id,client_name,client_email,title,summary,status,phase,progress,due_date,next_step,created_at,updated_at,enquiry_id,request_reference,accepted_at FROM veloryz_studio.studio_client_projects ORDER BY updated_at DESC LIMIT 200$query_8$),
($query_9$SELECT id,client_name,client_email,title,summary,status,phase,progress,due_date,next_step,created_at,updated_at,enquiry_id,request_reference,brief_details,accepted_at FROM veloryz_studio.studio_client_projects WHERE id=?$query_9$),
($query_10$SELECT id,project_id,sender,body,read_at,created_at FROM veloryz_studio.studio_client_messages WHERE project_id=? ORDER BY created_at DESC LIMIT 150$query_10$)
) AS v(query)
ON CONFLICT (key) DO NOTHING;
