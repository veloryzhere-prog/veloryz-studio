-- Synchronized with the applied production migration; server-only receipt persistence.
GRANT SELECT, INSERT ON TABLE veloryz_studio.studio_privacy_receipts TO service_role;
REVOKE ALL ON TABLE veloryz_studio.studio_privacy_receipts FROM PUBLIC, anon, authenticated;
ALTER TABLE veloryz_studio.studio_privacy_receipts ENABLE ROW LEVEL SECURITY;
