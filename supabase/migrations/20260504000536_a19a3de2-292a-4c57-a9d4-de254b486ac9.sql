
-- ============ Report Cards ============
CREATE TABLE IF NOT EXISTS public.report_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  class_id uuid,
  academic_year text NOT NULL,
  term text NOT NULL,
  subjects jsonb NOT NULL DEFAULT '[]'::jsonb,
  attendance_present integer DEFAULT 0,
  attendance_total integer DEFAULT 0,
  conduct text,
  attitude text,
  position text,
  class_teacher_remark text,
  headteacher_remark text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, academic_year, term)
);

ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage report cards"
ON public.report_cards FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers manage report cards for their classes"
ON public.report_cards FOR ALL
USING (public.has_role(auth.uid(), 'teacher') AND class_id IS NOT NULL AND public.teaches_class(auth.uid(), class_id))
WITH CHECK (public.has_role(auth.uid(), 'teacher') AND class_id IS NOT NULL AND public.teaches_class(auth.uid(), class_id));

CREATE POLICY "Parents view child report cards"
ON public.report_cards FOR SELECT
USING (public.has_role(auth.uid(), 'parent') AND public.is_parent_of(auth.uid(), student_id));

CREATE TRIGGER report_cards_updated_at
BEFORE UPDATE ON public.report_cards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Audit Events ============
CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit events"
ON public.audit_events FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated insert audit events"
ON public.audit_events FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON public.audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON public.audit_events(entity, entity_id);

-- ============ Helpful indexes ============
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_results_lookup ON public.results(class_id, academic_year, term, subject);
CREATE INDEX IF NOT EXISTS idx_results_student ON public.results(student_id, academic_year, term);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance(class_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_fees_student ON public.fees(student_id, academic_year, term);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(published, created_at DESC);

-- ============ Storage policies for school-assets and student-photos ============
DO $$
BEGIN
  -- Public read already implicit via public bucket flag, but add explicit policy if missing
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read school-assets') THEN
    CREATE POLICY "Public read school-assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'school-assets');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins manage school-assets') THEN
    CREATE POLICY "Admins manage school-assets"
    ON storage.objects FOR ALL
    USING (bucket_id = 'school-assets' AND public.has_role(auth.uid(), 'admin'))
    WITH CHECK (bucket_id = 'school-assets' AND public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read student-photos') THEN
    CREATE POLICY "Public read student-photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'student-photos');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins manage student-photos') THEN
    CREATE POLICY "Admins manage student-photos"
    ON storage.objects FOR ALL
    USING (bucket_id = 'student-photos' AND public.has_role(auth.uid(), 'admin'))
    WITH CHECK (bucket_id = 'student-photos' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
