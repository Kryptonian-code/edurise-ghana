// Supabase-backed students store
import { supabase } from "@/integrations/supabase/client";

export interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: "Male" | "Female" | string;
  dateOfBirth?: string;
  classId?: string | null;
  className?: string; // joined from classes.name
  admissionNumber: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  status: "active" | "graduated" | "transferred" | "archived";
  photoUrl?: string;
  enrolledOn?: string;
}

interface DbStudent {
  id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  class_id: string | null;
  admission_number: string;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  status: string;
  photo_url: string | null;
  enrolled_on: string | null;
  classes?: { name: string } | null;
}

function rowToStudent(r: DbStudent): StudentRow {
  return {
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    middleName: r.middle_name || undefined,
    gender: r.gender || undefined,
    dateOfBirth: r.date_of_birth || undefined,
    classId: r.class_id,
    className: r.classes?.name,
    admissionNumber: r.admission_number,
    guardianName: r.guardian_name || undefined,
    guardianPhone: r.guardian_phone || undefined,
    guardianEmail: r.guardian_email || undefined,
    status: (r.status as any) || "active",
    photoUrl: r.photo_url || undefined,
    enrolledOn: r.enrolled_on || undefined,
  };
}

export async function listStudents(): Promise<StudentRow[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*, classes(name)")
    .order("first_name");
  if (error) throw error;
  return (data || []).map((r: any) => rowToStudent(r));
}

export async function getStudent(id: string): Promise<StudentRow | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*, classes(name)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToStudent(data as any) : null;
}

export interface SaveStudentInput {
  id?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: string;
  dateOfBirth?: string | null;
  classId?: string | null;
  admissionNumber: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  status?: string;
  photoUrl?: string;
}

export async function saveStudent(s: SaveStudentInput): Promise<StudentRow> {
  const payload: any = {
    first_name: s.firstName,
    last_name: s.lastName,
    middle_name: s.middleName || null,
    gender: s.gender || null,
    date_of_birth: s.dateOfBirth || null,
    class_id: s.classId || null,
    admission_number: s.admissionNumber,
    guardian_name: s.guardianName || null,
    guardian_phone: s.guardianPhone || null,
    guardian_email: s.guardianEmail || null,
    status: s.status || "active",
    photo_url: s.photoUrl || null,
  };
  if (s.id) {
    const { data, error } = await supabase.from("students").update(payload).eq("id", s.id).select("*, classes(name)").single();
    if (error) throw error;
    return rowToStudent(data as any);
  }
  const { data, error } = await supabase.from("students").insert(payload).select("*, classes(name)").single();
  if (error) throw error;
  return rowToStudent(data as any);
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadStudentPhoto(file: File, studentId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${studentId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("student-photos").upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) throw error;
  const { data } = supabase.storage.from("student-photos").getPublicUrl(path);
  return data.publicUrl;
}

export interface ClassRow { id: string; name: string; level: string; academicYear: string; }
export async function listClasses(): Promise<ClassRow[]> {
  const { data, error } = await supabase.from("classes").select("id,name,level,academic_year").order("name");
  if (error) throw error;
  return (data || []).map((r: any) => ({ id: r.id, name: r.name, level: r.level, academicYear: r.academic_year }));
}

export async function ensureClass(name: string, level?: string, academicYear?: string): Promise<ClassRow> {
  const { data: existing } = await supabase.from("classes").select("id,name,level,academic_year").eq("name", name).maybeSingle();
  if (existing) return { id: existing.id, name: existing.name, level: existing.level, academicYear: existing.academic_year };
  const { data, error } = await supabase.from("classes").insert({
    name,
    level: level || inferLevel(name),
    academic_year: academicYear || currentAcademicYear(),
  }).select("id,name,level,academic_year").single();
  if (error) throw error;
  return { id: data.id, name: data.name, level: data.level, academicYear: data.academic_year };
}

function inferLevel(name: string): string {
  if (name.startsWith("SHS")) return "SHS";
  if (name.startsWith("JHS")) return "JHS";
  if (name.startsWith("Primary")) return "Primary";
  if (name.startsWith("KG")) return "KG";
  return "Early Years";
}

export function currentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  // Academic year starts ~September in Ghana
  return now.getMonth() >= 8 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}
