-- ==========================================
-- MIGRATION: Fix Payment Proof Submission
-- ==========================================
-- Problem: The payments table has no RLS UPDATE policy for public users.
-- When submitPaymentProof() calls supabase.from('payments').update(...),
-- it is silently blocked by RLS.
--
-- Solution: Create a SECURITY DEFINER RPC function that runs with
-- elevated database privileges, bypassing RLS safely.
-- ==========================================

-- Drop old version if it exists
DROP FUNCTION IF EXISTS public.submit_payment_proof(TEXT, TEXT, TEXT);

-- Create the new SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.submit_payment_proof(
    p_code TEXT,
    p_proof_type TEXT,
    p_proof_data TEXT
)
RETURNS JSON AS $$
DECLARE
    v_registration_id UUID;
    v_payment_id UUID;
BEGIN
    -- Validate proof type
    IF p_proof_type NOT IN ('screenshot', 'reference') THEN
        RAISE EXCEPTION 'Invalid proof type: %. Must be screenshot or reference.', p_proof_type;
    END IF;

    -- Get registration id by code
    SELECT id INTO v_registration_id
    FROM public.registrations
    WHERE code = p_code;

    IF v_registration_id IS NULL THEN
        RAISE EXCEPTION 'Registration not found for code: %', p_code;
    END IF;

    -- Update or insert the payment proof
    UPDATE public.payments
    SET 
        proof_type = p_proof_type,
        proof_data = p_proof_data,
        status = 'pending'
    WHERE registration_id = v_registration_id
    RETURNING id INTO v_payment_id;

    -- If no payment row existed, insert one
    IF v_payment_id IS NULL THEN
        INSERT INTO public.payments (registration_id, proof_type, proof_data, status, amount)
        SELECT v_registration_id, p_proof_type, p_proof_data, 'pending',
               CASE WHEN r.package_type = 'package_a' THEN 100 ELSE 150 END
        FROM public.registrations r WHERE r.id = v_registration_id
        RETURNING id INTO v_payment_id;
    END IF;

    -- Update registration status to show payment was submitted
    UPDATE public.registrations
    SET 
        registration_status = 'Waiting For Novel Upload',
        payment_status = 'pending'
    WHERE id = v_registration_id;

    RETURN json_build_object(
        'success', true,
        'payment_id', v_payment_id,
        'registration_id', v_registration_id
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to submit payment proof: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to the anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.submit_payment_proof(TEXT, TEXT, TEXT) TO anon, authenticated;
