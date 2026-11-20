CREATE TABLE studio_request_events (
 request_id TEXT NOT NULL REFERENCES studio_enquiries(id) ON DELETE CASCADE,
 version INTEGER NOT NULL, status TEXT NOT NULL, notes TEXT NOT NULL, recorded_at TEXT NOT NULL,
 PRIMARY KEY(request_id,version)
);
--> statement-breakpoint
CREATE TRIGGER studio_request_created AFTER INSERT ON studio_enquiries BEGIN
 INSERT INTO studio_request_events VALUES (NEW.id,NEW.version,NEW.status,NEW.notes,NEW.updated_at);
END;
--> statement-breakpoint
CREATE TRIGGER studio_request_changed AFTER UPDATE OF version ON studio_enquiries BEGIN
 INSERT INTO studio_request_events VALUES (NEW.id,NEW.version,NEW.status,NEW.notes,NEW.updated_at);
END;
--> statement-breakpoint
INSERT INTO studio_request_events SELECT id,version,status,notes,updated_at FROM studio_enquiries;
--> statement-breakpoint
CREATE UNIQUE INDEX enquiry_confirmed_appointment ON studio_enquiries(preferred_date,preferred_time) WHERE status='confirmed' AND preferred_date<>'';
--> statement-breakpoint
DROP INDEX enquiry_confirmed_slot;
