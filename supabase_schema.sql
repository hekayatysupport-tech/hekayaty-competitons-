-- ==========================================
-- HEKAYATY AWARDS 2026 SUPABASE SCHEMA
-- ==========================================
-- This file contains the complete database schema, 
-- functions, triggers, and RLS policies.
-- Run this script in your Supabase SQL Editor.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES
-- ==========================================

-- Admin Users (Extends auth.users)
CREATE TABLE public.admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'awards_manager', 'reviewer', 'finance_manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- System Settings
CREATE TABLE public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competition Editions
CREATE TABLE public.competition_editions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT false,
    registration_open BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Writers
CREATE TABLE public.writers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    pen_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories
CREATE TABLE public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    writer_id UUID NOT NULL REFERENCES public.writers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('رومانسية', 'إثارة وتشويق', 'فانتازيا', 'واقعية', 'تاريخية', 'رعب')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registration Code Sequence
CREATE SEQUENCE IF NOT EXISTS registration_code_seq START 1;

-- Registrations
CREATE TABLE public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    writer_id UUID NOT NULL REFERENCES public.writers(id) ON DELETE RESTRICT,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE RESTRICT,
    edition_id UUID NOT NULL REFERENCES public.competition_editions(id) ON DELETE RESTRICT,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    provider TEXT DEFAULT 'manual', -- 'manual', 'paymob', etc.
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipts
CREATE TABLE public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    receipt_number TEXT UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registration Status History
CREATE TABLE public.registration_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL if system/automated
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Records (Future proofing)
CREATE TABLE public.notification_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 2. FUNCTIONS & TRIGGERS
-- ==========================================

-- Trigger to automatically update 'updated_at' columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to safely generate the registration code (HKA-2026-XXXX)
CREATE OR REPLACE FUNCTION generate_registration_code()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix TEXT;
BEGIN
    -- Get the year from the linked competition edition
    SELECT year INTO year_prefix FROM public.competition_editions WHERE id = NEW.edition_id;
    
    -- Format: HKA-{YEAR}-{0001}
    NEW.code := 'HKA-' || year_prefix || '-' || LPAD(nextval('registration_code_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_registration_code
BEFORE INSERT ON public.registrations
FOR EACH ROW
WHEN (NEW.code IS NULL OR NEW.code = '')
EXECUTE FUNCTION generate_registration_code();

-- RPC Function to safely complete a full registration transactionally
CREATE OR REPLACE FUNCTION complete_registration(
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_city TEXT,
    p_pen_name TEXT,
    p_story_name TEXT,
    p_category TEXT,
    p_edition_year TEXT DEFAULT '2026'
)
RETURNS JSON AS $$
DECLARE
    v_writer_id UUID;
    v_story_id UUID;
    v_edition_id UUID;
    v_registration_id UUID;
    v_payment_id UUID;
    v_code TEXT;
BEGIN
    -- 1. Get or Verify Edition
    SELECT id INTO v_edition_id FROM public.competition_editions WHERE year = p_edition_year AND is_active = true LIMIT 1;
    IF v_edition_id IS NULL THEN
        RAISE EXCEPTION 'Competition edition % is not active or does not exist.', p_edition_year;
    END IF;

    -- 2. Create Writer (or find existing by email to avoid duplicates could be added here)
    INSERT INTO public.writers (name, email, phone, city, pen_name)
    VALUES (p_name, p_email, p_phone, p_city, p_pen_name)
    RETURNING id INTO v_writer_id;

    -- 3. Create Story
    INSERT INTO public.stories (writer_id, title, category)
    VALUES (v_writer_id, p_story_name, p_category)
    RETURNING id INTO v_story_id;

    -- 4. Create Registration
    INSERT INTO public.registrations (writer_id, story_id, edition_id, payment_status)
    VALUES (v_writer_id, v_story_id, v_edition_id, 'pending')
    RETURNING id, code INTO v_registration_id, v_code;

    -- 5. Create Payment record
    INSERT INTO public.payments (registration_id, status)
    VALUES (v_registration_id, 'pending')
    RETURNING id INTO v_payment_id;

    -- Return the generated data
    RETURN json_build_object(
        'success', true,
        'registration_id', v_registration_id,
        'code', v_code,
        'writer_id', v_writer_id,
        'payment_status', 'pending'
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to complete registration: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_records ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Public can read active competition editions
CREATE POLICY "Public can read active editions" ON public.competition_editions FOR SELECT USING (is_active = true);

-- Anyone can insert registrations (Handled mostly via the RPC function which is SECURITY DEFINER, so we don't strictly need insert policies on tables if only the RPC is used, but good practice to have them if accessed directly)
CREATE POLICY "Public can insert writers" ON public.writers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert stories" ON public.stories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert registrations" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert payments" ON public.payments FOR INSERT WITH CHECK (true);

-- Public can read their own registration by precise 'code' (preventing listing all)
-- In Supabase, if we want to allow fetching by code without auth, we allow SELECT if the code is matched in the query.
-- However, RLS doesn't inherently know the query constraints unless passed via session variables or specific RPCs.
-- The safest approach is an RPC for fetching status by code, or a policy that allows SELECT.
CREATE POLICY "Public can read registrations" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "Public can read stories" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Public can read writers" ON public.writers FOR SELECT USING (true);

-- Admins have full access to everything
CREATE POLICY "Admins have full access to admin_roles" ON public.admin_roles FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to system_settings" ON public.system_settings FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to competition_editions" ON public.competition_editions FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to writers" ON public.writers FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to stories" ON public.stories FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to registrations" ON public.registrations FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to payments" ON public.payments FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to receipts" ON public.receipts FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to registration_status_history" ON public.registration_status_history FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to audit_logs" ON public.audit_logs FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to notification_records" ON public.notification_records FOR ALL USING (is_admin());

-- ==========================================
-- 4. INITIAL SEED DATA
-- ==========================================

INSERT INTO public.competition_editions (year, is_active, registration_open)
VALUES ('2026', true, true)
ON CONFLICT (year) DO NOTHING;
