/*
# Certificate Number Generation Trigger

## Overview
Auto-generates unique certificate numbers in the format PR-CERT-YYYY-NNNNNN
when a new certificate is inserted without a certificate_number.
*/

CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_num integer;
  year_str text;
BEGIN
  year_str := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_number FROM 13 FOR 6) AS integer)), 0) + 1
  INTO next_num
  FROM public.certificates
  WHERE certificate_number LIKE 'PR-CERT-' || year_str || '-%';
  NEW.certificate_number := 'PR-CERT-' || year_str || '-' || lpad(next_num::text, 6, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_certificate_number ON public.certificates;
CREATE TRIGGER trg_generate_certificate_number
  BEFORE INSERT ON public.certificates
  FOR EACH ROW
  WHEN (NEW.certificate_number IS NULL)
  EXECUTE FUNCTION public.generate_certificate_number();

-- Also auto-generate verification token if not provided
CREATE OR REPLACE FUNCTION public.generate_verification_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.verification_token IS NULL THEN
    NEW.verification_token := encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_verification_token ON public.certificates;
CREATE TRIGGER trg_generate_verification_token
  BEFORE INSERT ON public.certificates
  FOR EACH ROW
  WHEN (NEW.verification_token IS NULL)
  EXECUTE FUNCTION public.generate_verification_token();
