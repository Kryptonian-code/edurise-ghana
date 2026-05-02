
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'parent', 'student');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE public.fee_status AS ENUM ('unpaid', 'partial', 'paid', 'overdue');
CREATE TYPE public.admission_status AS ENUM ('pending', 'reviewing', 'approved', 'rejected');
CREATE TYPE public.student_status AS ENUM ('active', 'inactive', 'graduated', 'transferred');

-- =========================================================
-- UPDATED-AT HELPER
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- USER ROLES (separate table to prevent privilege escalation)
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer role check (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- =========================================================
-- AUTO-CREATE PROFILE + DEFAULT ROLE ON SIGNUP
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'parent');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- CLASSES
-- =========================================================
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  class_teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  capacity INT DEFAULT 40,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_classes_updated BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- TEACHER ↔ CLASSES
-- =========================================================
CREATE TABLE public.teacher_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, class_id, subject)
);
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.teaches_class(_user_id UUID, _class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teacher_classes
    WHERE teacher_id = _user_id AND class_id = _class_id
  );
$$;

-- =========================================================
-- STUDENTS
-- =========================================================
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_number TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  gender TEXT,
  date_of_birth DATE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  address TEXT,
  photo_url TEXT,
  status student_status NOT NULL DEFAULT 'active',
  enrolled_on DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- PARENT ↔ STUDENTS
-- =========================================================
CREATE TABLE public.parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'guardian',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, student_id)
);
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_parent_of(_user_id UUID, _student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_students
    WHERE parent_id = _user_id AND student_id = _student_id
  );
$$;

CREATE OR REPLACE FUNCTION public.teaches_student(_user_id UUID, _student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.teacher_classes tc ON tc.class_id = s.class_id
    WHERE s.id = _student_id AND tc.teacher_id = _user_id
  );
$$;

-- =========================================================
-- SUBJECTS
-- =========================================================
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, level)
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- ATTENDANCE
-- =========================================================
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status attendance_status NOT NULL,
  remark TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, date)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);

-- =========================================================
-- RESULTS
-- =========================================================
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  class_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  exam_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  remark TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, subject, academic_year, term)
);
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_results_updated BEFORE UPDATE ON public.results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- FEES
-- =========================================================
CREATE TABLE public.fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT 'School Fees',
  amount NUMERIC(12,2) NOT NULL,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date DATE,
  status fee_status NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_fees_updated BEFORE UPDATE ON public.fees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_id UUID NOT NULL REFERENCES public.fees(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  method TEXT NOT NULL DEFAULT 'cash',
  reference TEXT,
  paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- ADMISSIONS
-- =========================================================
CREATE TABLE public.admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_first_name TEXT NOT NULL,
  child_last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  applying_for_class TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  address TEXT,
  previous_school TEXT,
  notes TEXT,
  status admission_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_admissions_updated BEFORE UPDATE ON public.admissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- ANNOUNCEMENTS
-- =========================================================
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all', -- all | parents | teachers | class
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_announcements_updated BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- CMS CONTENT
-- =========================================================
CREATE TABLE public.news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  body TEXT NOT NULL,
  cover_image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_news_updated BEFORE UPDATE ON public.news_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location TEXT,
  cover_image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  email TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_staff_updated BEFORE UPDATE ON public.staff_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.school_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL DEFAULT 'Prestige Academy International',
  motto TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  primary_color TEXT,
  accent_color TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  whatsapp_number TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.school_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.school_settings (school_name, motto) VALUES
  ('Prestige Academy International', 'Excellence Through Knowledge');

-- =========================================================
-- RLS POLICIES
-- =========================================================

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- classes
CREATE POLICY "Authenticated read classes" ON public.classes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage classes" ON public.classes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- teacher_classes
CREATE POLICY "Teachers view own assignments" ON public.teacher_classes
  FOR SELECT USING (auth.uid() = teacher_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage teacher_classes" ON public.teacher_classes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- students
CREATE POLICY "Admins view all students" ON public.students
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers view their class students" ON public.students
  FOR SELECT USING (
    public.has_role(auth.uid(), 'teacher')
    AND class_id IS NOT NULL
    AND public.teaches_class(auth.uid(), class_id)
  );
CREATE POLICY "Parents view their children" ON public.students
  FOR SELECT USING (
    public.has_role(auth.uid(), 'parent')
    AND public.is_parent_of(auth.uid(), id)
  );
CREATE POLICY "Admins manage students" ON public.students
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- parent_students
CREATE POLICY "Parents view own links" ON public.parent_students
  FOR SELECT USING (auth.uid() = parent_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage parent_students" ON public.parent_students
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- subjects
CREATE POLICY "Authenticated read subjects" ON public.subjects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage subjects" ON public.subjects
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- attendance
CREATE POLICY "Admins manage attendance" ON public.attendance
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers manage attendance for their classes" ON public.attendance
  FOR ALL USING (
    public.has_role(auth.uid(), 'teacher')
    AND class_id IS NOT NULL
    AND public.teaches_class(auth.uid(), class_id)
  ) WITH CHECK (
    public.has_role(auth.uid(), 'teacher')
    AND class_id IS NOT NULL
    AND public.teaches_class(auth.uid(), class_id)
  );
CREATE POLICY "Parents view child attendance" ON public.attendance
  FOR SELECT USING (
    public.has_role(auth.uid(), 'parent')
    AND public.is_parent_of(auth.uid(), student_id)
  );

-- results
CREATE POLICY "Admins manage results" ON public.results
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers manage results for their classes" ON public.results
  FOR ALL USING (
    public.has_role(auth.uid(), 'teacher')
    AND class_id IS NOT NULL
    AND public.teaches_class(auth.uid(), class_id)
  ) WITH CHECK (
    public.has_role(auth.uid(), 'teacher')
    AND class_id IS NOT NULL
    AND public.teaches_class(auth.uid(), class_id)
  );
CREATE POLICY "Parents view child results" ON public.results
  FOR SELECT USING (
    public.has_role(auth.uid(), 'parent')
    AND public.is_parent_of(auth.uid(), student_id)
  );

-- fees
CREATE POLICY "Admins manage fees" ON public.fees
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Parents view child fees" ON public.fees
  FOR SELECT USING (
    public.has_role(auth.uid(), 'parent')
    AND public.is_parent_of(auth.uid(), student_id)
  );

-- fee_payments
CREATE POLICY "Admins manage fee payments" ON public.fee_payments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Parents view child fee payments" ON public.fee_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.fees f
      WHERE f.id = fee_id
        AND public.is_parent_of(auth.uid(), f.student_id)
    )
  );

-- admissions (anyone can apply, only admins manage)
CREATE POLICY "Anyone can submit application" ON public.admissions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage admissions" ON public.admissions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- announcements
CREATE POLICY "Authenticated read announcements" ON public.announcements
  FOR SELECT TO authenticated USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage announcements" ON public.announcements
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CMS public-read tables
CREATE POLICY "Public read news" ON public.news_posts
  FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage news" ON public.news_posts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read events" ON public.events
  FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage events" ON public.events
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read gallery" ON public.gallery_items
  FOR SELECT USING (true);
CREATE POLICY "Admins manage gallery" ON public.gallery_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read staff" ON public.staff_members
  FOR SELECT USING (true);
CREATE POLICY "Admins manage staff" ON public.staff_members
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read faqs" ON public.faqs
  FOR SELECT USING (true);
CREATE POLICY "Admins manage faqs" ON public.faqs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read settings" ON public.school_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.school_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('school-assets', 'school-assets', true),
  ('student-photos', 'student-photos', true),
  ('documents', 'documents', false);

-- school-assets: public read, admin write
CREATE POLICY "Public read school-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'school-assets');
CREATE POLICY "Admins write school-assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'school-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update school-assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'school-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete school-assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'school-assets' AND public.has_role(auth.uid(), 'admin'));

-- student-photos: public read, admin write
CREATE POLICY "Public read student-photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'student-photos');
CREATE POLICY "Admins write student-photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'student-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update student-photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'student-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete student-photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'student-photos' AND public.has_role(auth.uid(), 'admin'));

-- documents: admin only
CREATE POLICY "Admins read documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update documents" ON storage.objects
  FOR UPDATE USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));
