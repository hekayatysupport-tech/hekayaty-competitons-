-- ==========================================
-- MIGRATION: HEKAYATY AWARDS 2026 - PACKAGE & PAYMENT SYSTEM
-- ==========================================
-- This script updates the database to support Package A/B,
-- multiple stories per registration, and manual payment proofs.

-- 1. Alter Registrations Table
ALTER TABLE public.registrations
    DROP CONSTRAINT IF EXISTS registrations_story_id_fkey,
    DROP COLUMN IF EXISTS story_id,
    ADD COLUMN IF NOT EXISTS package_type TEXT NOT NULL DEFAULT 'package_a' CHECK (package_type IN ('package_a', 'package_b')),
    ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 2. Alter Stories Table
-- Add registration_id and link it to the registration. Remove writer_id as it is redundant,
-- but for data preservation, we can keep it and just make it nullable or keep it as is.
ALTER TABLE public.stories
    ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS description TEXT;

-- (Optional) If there is existing data where story_id was in registrations, we would migrate it here.
-- Assuming test data can be wiped or is minimal, we just add the columns.

-- 3. Alter Payments Table
ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS proof_type TEXT CHECK (proof_type IN ('screenshot', 'reference')),
    ADD COLUMN IF NOT EXISTS proof_data TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- 4. Rewrite complete_registration RPC
CREATE OR REPLACE FUNCTION public.complete_registration(
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_city TEXT,
    p_pen_name TEXT,
    p_package_type TEXT,
    p_stories JSON, -- JSON array of { title, category, description }
    p_edition_year TEXT DEFAULT '2026'
)
RETURNS JSON AS $$
DECLARE
    v_writer_id UUID;
    v_edition_id UUID;
    v_registration_id UUID;
    v_payment_id UUID;
    v_code TEXT;
    v_amount NUMERIC;
    v_max_stories INT;
    v_story_count INT;
    v_story RECORD;
BEGIN
    -- 1. Package Validation
    IF p_package_type = 'package_a' THEN
        v_amount := 100.00;
        v_max_stories := 1;
    ELSIF p_package_type = 'package_b' THEN
        v_amount := 150.00;
        v_max_stories := 3;
    ELSE
        RAISE EXCEPTION 'Invalid package type: %', p_package_type;
    END IF;

    -- Validate story count
    v_story_count := json_array_length(p_stories);
    IF v_story_count < 1 THEN
        RAISE EXCEPTION 'At least one story must be provided.';
    END IF;
    IF v_story_count > v_max_stories THEN
        RAISE EXCEPTION 'Package % allows a maximum of % stories. Received %.', p_package_type, v_max_stories, v_story_count;
    END IF;

    -- 2. Get Edition
    SELECT id INTO v_edition_id FROM public.competition_editions WHERE year = p_edition_year AND is_active = true LIMIT 1;
    IF v_edition_id IS NULL THEN
        RAISE EXCEPTION 'Competition edition % is not active or does not exist.', p_edition_year;
    END IF;

    -- 3. Create Writer
    INSERT INTO public.writers (name, email, phone, city, pen_name)
    VALUES (p_name, p_email, p_phone, p_city, p_pen_name)
    RETURNING id INTO v_writer_id;

    -- 4. Create Registration
    INSERT INTO public.registrations (writer_id, edition_id, package_type, payment_status)
    VALUES (v_writer_id, v_edition_id, p_package_type, 'pending')
    RETURNING id, code INTO v_registration_id, v_code;

    -- 5. Create Stories
    FOR v_story IN SELECT * FROM json_populate_recordset(null::record, p_stories) AS (title text, category text, description text)
    LOOP
        INSERT INTO public.stories (writer_id, registration_id, title, category, description)
        VALUES (v_writer_id, v_registration_id, v_story.title, v_story.category, v_story.description);
    END LOOP;

    -- 6. Create Payment record
    INSERT INTO public.payments (registration_id, amount, status)
    VALUES (v_registration_id, v_amount, 'pending')
    RETURNING id INTO v_payment_id;

    -- Return the generated data
    RETURN json_build_object(
        'success', true,
        'registration_id', v_registration_id,
        'code', v_code,
        'payment_id', v_payment_id,
        'amount', v_amount
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to complete registration: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. Create Storage Bucket for Payment Proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment_proofs', 
  'payment_proofs', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Set up RLS for Storage Bucket
-- Public can upload files
CREATE POLICY "Public can upload payment proofs"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'payment_proofs');

-- Public can read their own files (or anyone can read public files)
CREATE POLICY "Anyone can view payment proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment_proofs');

-- Admins can do anything in the bucket
CREATE POLICY "Admins have full access to payment proofs"
ON storage.objects FOR ALL
TO public
USING (
  bucket_id = 'payment_proofs' AND 
  EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
);
