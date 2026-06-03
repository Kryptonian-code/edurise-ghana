-- ============ CMS Content ============
CREATE TABLE IF NOT EXISTS public.cms_content (
  section text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.cms_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_content TO authenticated;
GRANT ALL ON public.cms_content TO service_role;

ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'cms_content' AND policyname = 'Anyone can read CMS content'
  ) THEN
    CREATE POLICY "Anyone can read CMS content"
    ON public.cms_content
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'cms_content' AND policyname = 'Admins can insert CMS content'
  ) THEN
    CREATE POLICY "Admins can insert CMS content"
    ON public.cms_content
    FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'cms_content' AND policyname = 'Admins can update CMS content'
  ) THEN
    CREATE POLICY "Admins can update CMS content"
    ON public.cms_content
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'cms_content' AND policyname = 'Admins can delete CMS content'
  ) THEN
    CREATE POLICY "Admins can delete CMS content"
    ON public.cms_content
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DROP TRIGGER IF EXISTS cms_content_updated_at ON public.cms_content;
CREATE TRIGGER cms_content_updated_at
BEFORE UPDATE ON public.cms_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.cms_content (section, data)
VALUES
  ('homepage', '{
    "heroHeading": "Building Future Leaders Through Excellence",
    "heroSubtitle": "A premier private school in Accra offering quality education from Crèche to SHS. We nurture young minds to become confident, responsible, and globally competitive citizens.",
    "heroCTA1": "Apply for Admission",
    "heroCTA2": "Learn More",
    "whyChooseTitle": "Why Choose Prestige Academy?",
    "whyChooseText": "At Prestige Academy, we believe every child has the potential to achieve greatness. Our holistic approach to education combines rigorous academics with character development, sports, arts, and technology to produce well-rounded graduates ready to lead in the 21st century.",
    "whyChoosePoints": [
      "Experienced and dedicated teaching staff",
      "Modern ICT and science laboratories",
      "Small class sizes for personalised attention",
      "Strong BECE and WASSCE track record",
      "Safe and nurturing learning environment",
      "Co-curricular activities and leadership programmes"
    ],
    "ctaHeading": "Ready to Give Your Child the Best Education?",
    "ctaText": "Admissions are currently open for the 2025/2026 academic year. Secure your child''s place today.",
    "ctaButton": "Start Application"
  }'::jsonb),
  ('about', '{
    "history": "Prestige Academy International was established with a singular vision: to create a world-class educational institution that nurtures the intellectual, moral, and physical development of every child. From humble beginnings with just 35 pupils, we have grown into one of the most respected private schools in Accra.",
    "historyPara2": "Our school community is built on the values of integrity, discipline, hard work, and respect. We believe that education is the most powerful tool for transforming lives and building prosperous communities.",
    "historyPara3": "Today, we serve over 800 students from Crèche to Senior High School, guided by more than 60 dedicated teachers and support staff. Our graduates consistently excel in national examinations and go on to attend top secondary schools and universities.",
    "mission": "To provide quality, holistic education that develops confident, responsible, and innovative young people who are prepared to contribute meaningfully to their communities and the world.",
    "vision": "To be the leading private school in Ghana, recognised for academic excellence, character development, and the production of future leaders who make a positive impact in society.",
    "values": [
      { "title": "Integrity", "desc": "We uphold honesty and strong moral principles in all we do." },
      { "title": "Excellence", "desc": "We strive for the highest standards in academics and character." },
      { "title": "Community", "desc": "We foster a sense of belonging, respect, and teamwork." },
      { "title": "Innovation", "desc": "We embrace modern teaching methods and technology." }
    ]
  }'::jsonb),
  ('contact', '{
    "officeHours": "Mon - Fri: 7:30 AM - 4:00 PM"
  }'::jsonb),
  ('footer', '{
    "copyright": "© 2025 Prestige Academy International. All rights reserved.",
    "tagline": "Excellence Through Knowledge"
  }'::jsonb)
ON CONFLICT (section) DO UPDATE
SET data = EXCLUDED.data,
    updated_at = now();

-- ============ Admission Applications ============
CREATE TABLE IF NOT EXISTS public.admission_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_name text NOT NULL,
  child_dob date,
  gender text,
  class_applied text NOT NULL,
  parent_name text NOT NULL,
  parent_phone text NOT NULL,
  parent_email text,
  previous_school text,
  notes text,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Approved', 'Rejected')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid,
  reviewed_at timestamptz
);

GRANT INSERT ON public.admission_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admission_applications TO authenticated;
GRANT ALL ON public.admission_applications TO service_role;

ALTER TABLE public.admission_applications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admission_applications' AND policyname = 'Anyone can submit admission applications'
  ) THEN
    CREATE POLICY "Anyone can submit admission applications"
    ON public.admission_applications
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (status = 'Pending' AND reviewed_by IS NULL AND reviewed_at IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admission_applications' AND policyname = 'Admins can read admission applications'
  ) THEN
    CREATE POLICY "Admins can read admission applications"
    ON public.admission_applications
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admission_applications' AND policyname = 'Admins can update admission applications'
  ) THEN
    CREATE POLICY "Admins can update admission applications"
    ON public.admission_applications
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admission_applications' AND policyname = 'Admins can delete admission applications'
  ) THEN
    CREATE POLICY "Admins can delete admission applications"
    ON public.admission_applications
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_admission_applications_status ON public.admission_applications(status);
CREATE INDEX IF NOT EXISTS idx_admission_applications_submitted_at ON public.admission_applications(submitted_at DESC);

CREATE OR REPLACE FUNCTION public.set_admission_review_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.reviewed_by = auth.uid();
    NEW.reviewed_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS admission_review_fields ON public.admission_applications;
CREATE TRIGGER admission_review_fields
BEFORE UPDATE OF status ON public.admission_applications
FOR EACH ROW
EXECUTE FUNCTION public.set_admission_review_fields();

CREATE OR REPLACE FUNCTION public.audit_admission_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.audit_events (actor_id, action, entity, entity_id, metadata)
    VALUES (
      auth.uid(),
      'admission_status_update',
      'admission_application',
      NEW.id::text,
      jsonb_build_object(
        'childName', NEW.child_name,
        'previousStatus', OLD.status,
        'newStatus', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_admission_status_change ON public.admission_applications;
CREATE TRIGGER audit_admission_status_change
AFTER UPDATE OF status ON public.admission_applications
FOR EACH ROW
EXECUTE FUNCTION public.audit_admission_status_change();