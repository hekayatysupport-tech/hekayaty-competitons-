UPDATE public.stories
SET upload_status = 'sent'
WHERE upload_status = 'pending' AND file_name IS NULL;

UPDATE public.registrations
SET registration_status = 'Under Review'
WHERE registration_status IN ('Payment Submitted', 'Payment Verified', 'Waiting For Novel Upload')
  AND id IN (
    SELECT registration_id FROM public.stories WHERE upload_status = 'sent'
  );
