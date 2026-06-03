REVOKE EXECUTE ON FUNCTION public.set_admission_review_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_admission_status_change() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_admission_review_fields() TO service_role;
GRANT EXECUTE ON FUNCTION public.audit_admission_status_change() TO service_role;