-- ==========================================
-- MIGRATION: HEKAYATY AWARDS 2026 - TELEGRAM SYSTEM
-- ==========================================

-- 1. Alter Registrations Table
ALTER TABLE public.registrations
    ADD COLUMN IF NOT EXISTS registration_status TEXT NOT NULL DEFAULT 'Registration Started'
    CHECK (registration_status IN (
        'Registration Started',
        'Information Completed',
        'Waiting For Payment',
        'Payment Submitted',
        'Payment Verified',
        'Waiting For Novel Upload',
        'Novel Uploaded',
        'Sent To Telegram',
        'Submission Completed'
    ));

-- Migrate existing data from payment_status to registration_status
UPDATE public.registrations
SET registration_status = CASE
    WHEN payment_status = 'pending' THEN 'Payment Submitted'
    WHEN payment_status = 'verified' THEN 'Payment Verified'
    WHEN payment_status = 'rejected' THEN 'Waiting For Payment'
    ELSE 'Registration Started'
END;

-- 2. Alter Stories Table
ALTER TABLE public.stories
    ADD COLUMN IF NOT EXISTS telegram_message_id TEXT,
    ADD COLUMN IF NOT EXISTS telegram_file_id TEXT,
    ADD COLUMN IF NOT EXISTS telegram_date TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'sent', 'failed')),
    ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS file_name TEXT,
    ADD COLUMN IF NOT EXISTS file_size BIGINT,
    ADD COLUMN IF NOT EXISTS mime_type TEXT,
    ADD COLUMN IF NOT EXISTS telegram_delivery_status TEXT DEFAULT 'pending' CHECK (telegram_delivery_status IN ('pending', 'success', 'failed')),
    ADD COLUMN IF NOT EXISTS submission_completed BOOLEAN DEFAULT false;

-- 3. Rewrite complete_registration RPC to handle new status
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
    INSERT INTO public.registrations (writer_id, edition_id, package_type, payment_status, registration_status)
    VALUES (v_writer_id, v_edition_id, p_package_type, 'pending', 'Payment Submitted')
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
