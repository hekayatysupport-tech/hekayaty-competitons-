CREATE OR REPLACE FUNCTION mark_story_uploaded(
  p_story_id UUID,
  p_registration_id UUID,
  p_telegram_message_id TEXT,
  p_telegram_file_id TEXT,
  p_file_name TEXT,
  p_file_size BIGINT,
  p_mime_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Update the story record
  UPDATE public.stories
  SET 
    telegram_message_id = p_telegram_message_id,
    telegram_file_id = p_telegram_file_id,
    telegram_date = NOW(),
    upload_status = 'sent',
    uploaded_at = NOW(),
    file_name = p_file_name,
    file_size = p_file_size,
    mime_type = p_mime_type,
    telegram_delivery_status = 'success',
    submission_completed = true
  WHERE id = p_story_id;

  -- 2. Update the registration status to 'Under Review'
  IF p_registration_id IS NOT NULL THEN
    UPDATE public.registrations
    SET registration_status = 'Under Review'
    WHERE id = p_registration_id;
  END IF;

  RETURN TRUE;
END;
$$;
