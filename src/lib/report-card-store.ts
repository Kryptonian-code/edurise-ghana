// Supabase-backed report card store
import { supabase } from "@/integrations/supabase/client";

export interface SubjectScore {
  subject: string;
  classScore: number;
  examScore: number;
  remark?: string;
}

export interface ReportCard {
  id?: string;
  studentId: string;
  classId?: string | null;
  academicYear: string;
  term: string;
  subjects: SubjectScore[];
  attendancePresent?: number;
  attendanceTotal?: number;
  classTeacherRemark?: string;
  headteacherRemark?: string;
  conduct?: string;
  attitude?: string;
  position?: string;
}

const DEFAULT_SUBJECTS_PRIMARY = [
  "English Language", "Mathematics", "Integrated Science", "Social Studies",
  "Religious & Moral Education", "Creative Arts", "Computing (ICT)",
  "Ghanaian Language", "French",
];
const DEFAULT_SUBJECTS_JHS = [
  "English Language", "Mathematics", "Integrated Science", "Social Studies",
  "Religious & Moral Education", "Career Technology", "Computing (ICT)",
  "Ghanaian Language", "French",
];
const DEFAULT_SUBJECTS_SHS = [
  "English Language", "Core Mathematics", "Integrated Science", "Social Studies",
  "Elective Mathematics", "Physics", "Chemistry", "Biology",
];

export function defaultSubjectsForClass(klass: string): string[] {
  if (!klass) return ["English Language", "Mathematics"];
  if (klass.startsWith("SHS")) return DEFAULT_SUBJECTS_SHS;
  if (klass.startsWith("JHS")) return DEFAULT_SUBJECTS_JHS;
  if (klass.startsWith("Primary")) return DEFAULT_SUBJECTS_PRIMARY;
  return ["English Language", "Mathematics", "Environmental Studies", "Creative Arts", "Religious & Moral Education"];
}

function fromRow(r: any): ReportCard {
  return {
    id: r.id,
    studentId: r.student_id,
    classId: r.class_id,
    academicYear: r.academic_year,
    term: r.term,
    subjects: Array.isArray(r.subjects) ? r.subjects : [],
    attendancePresent: r.attendance_present ?? 0,
    attendanceTotal: r.attendance_total ?? 0,
    classTeacherRemark: r.class_teacher_remark || "",
    headteacherRemark: r.headteacher_remark || "",
    conduct: r.conduct || "",
    attitude: r.attitude || "",
    position: r.position || "",
  };
}

export async function getReportCard(studentId: string, year: string, term: string): Promise<ReportCard | null> {
  const { data, error } = await supabase.from("report_cards" as any)
    .select("*")
    .eq("student_id", studentId)
    .eq("academic_year", year)
    .eq("term", term)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function saveReportCard(card: ReportCard): Promise<ReportCard> {
  const payload: any = {
    student_id: card.studentId,
    class_id: card.classId || null,
    academic_year: card.academicYear,
    term: card.term,
    subjects: card.subjects,
    attendance_present: card.attendancePresent ?? 0,
    attendance_total: card.attendanceTotal ?? 0,
    conduct: card.conduct || null,
    attitude: card.attitude || null,
    position: card.position || null,
    class_teacher_remark: card.classTeacherRemark || null,
    headteacher_remark: card.headteacherRemark || null,
  };
  const { data, error } = await supabase.from("report_cards" as any)
    .upsert(payload, { onConflict: "student_id,academic_year,term" })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export function gradeFor(total: number): { grade: string; remark: string } {
  if (total >= 80) return { grade: "A1", remark: "Excellent" };
  if (total >= 75) return { grade: "B2", remark: "Very Good" };
  if (total >= 70) return { grade: "B3", remark: "Good" };
  if (total >= 65) return { grade: "C4", remark: "Credit" };
  if (total >= 60) return { grade: "C5", remark: "Credit" };
  if (total >= 55) return { grade: "C6", remark: "Credit" };
  if (total >= 50) return { grade: "D7", remark: "Pass" };
  if (total >= 45) return { grade: "E8", remark: "Pass" };
  return { grade: "F9", remark: "Fail" };
}

export function buildDefaultReportCard(studentId: string, klass: string, year: string, term: string, classId?: string | null): ReportCard {
  return {
    studentId,
    classId: classId || null,
    academicYear: year,
    term,
    subjects: defaultSubjectsForClass(klass).map(subject => ({ subject, classScore: 0, examScore: 0, remark: "" })),
    attendancePresent: 0,
    attendanceTotal: 0,
    classTeacherRemark: "",
    headteacherRemark: "",
    conduct: "Good",
    attitude: "Good",
  };
}
