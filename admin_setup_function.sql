-- Run this in your Supabase SQL Editor ONCE before using the setup page.
-- This creates a SECURITY DEFINER function that allows the setup page
-- to insert into admin_roles even without existing admin privileges.

CREATE OR REPLACE FUNCTION public.register_as_admin(
    p_user_id UUID,
    p_role TEXT DEFAULT 'super_admin'
)
RETURNS JSON AS $$
BEGIN
    -- Validate role
    IF p_role NOT IN ('super_admin', 'awards_manager', 'reviewer', 'finance_manager') THEN
        RAISE EXCEPTION 'Invalid role: %', p_role;
    END IF;

    -- Insert into admin_roles, ignore if already exists
    INSERT INTO public.admin_roles (user_id, role)
    VALUES (p_user_id, p_role)
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

    RETURN json_build_object('success', true, 'user_id', p_user_id, 'role', p_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
