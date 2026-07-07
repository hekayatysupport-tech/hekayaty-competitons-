-- ============================================================
-- STEP 1: Add new ENUM values
-- Run this query FIRST. Wait for it to succeed before Step 2.
-- ============================================================
ALTER TYPE registration_status ADD VALUE IF NOT EXISTS 'Under Review';
ALTER TYPE registration_status ADD VALUE IF NOT EXISTS 'Approved';
ALTER TYPE registration_status ADD VALUE IF NOT EXISTS 'Rejected';
ALTER TYPE registration_status ADD VALUE IF NOT EXISTS 'Needs Attention';


-- ============================================================
-- STEP 2: Migrate old records (run in a SEPARATE query tab)
-- Postgres requires ENUM changes to be committed first.
-- Open a new query tab in Supabase, paste and run ONLY this:
-- ============================================================
-- UPDATE registrations 
-- SET registration_status = 'Under Review' 
-- WHERE registration_status IN ('Submission Completed', 'Sent To Telegram', 'Novel Uploaded');
