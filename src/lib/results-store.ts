// Supabase-backed results store
import { supabase } from "@/integrations/supabase/client";

export interface SubjectScoreEntry {
  classScore: number; // 0-50
  examScore: number;  // 0-50
}

export async function getSubjectScores(
  year: string, term: string, classId: string | undefined, subject: string
): Promise<Record<string, SubjectScoreEntry>> {
  let q = supabase.from("results")
    .select("student_id, class_score, exam_score")
    .eq("academic_year", year)
    .eq("term", term)
    .eq("subject", subject);
  if (classId) q = q.eq("class_id", classId);
  const { data, error } = await q;
  if (error) throw error;
  const map: Record<string, SubjectScoreEntry> = {};
  for (const r of data || []) {
    map[(r as any).student_id] = {
      classScore: Number((r as any).class_score) || 0,
      examScore: Number((r as any).exam_score) || 0,
    };
  }
  return map;
}

export async function saveSubjectScores(
  year: string, term: string, classId: string | undefined, subject: string,
  scores: Record<string, SubjectScoreEntry>
): Promise<void> {
  const rows = Object.entries(scores).map(([student_id, e]) => ({
    student_id,
    class_id: classId || null,
    academic_year: year,
    term,
    subject,
    class_score: e.classScore,
    exam_score: e.examScore,
  }));
  if (rows.length === 0) return;

  // Use delete + insert per (year,term,classId,subject) to keep it simple
  let del = supabase.from("results").delete()
    .eq("academic_year", year).eq("term", term).eq("subject", subject);
  if (classId) del = del.eq("class_id", classId);
  const { error: dErr } = await del;
  if (dErr) throw dErr;

  const { error: iErr } = await supabase.from("results").insert(rows);
  if (iErr) throw iErr;
}

export async function getStudentTermScores(
  studentId: string, year: string, term: string
): Promise<Array<{ subject: string; classScore: number; examScore: number; remark?: string }>> {
  const { data, error } = await supabase.from("results")
    .select("subject, class_score, exam_score, remark")
    .eq("student_id", studentId)
    .eq("academic_year", year)
    .eq("term", term);
  if (error) throw error;
  return (data || []).map((r: any) => ({
    subject: r.subject,
    classScore: Number(r.class_score) || 0,
    examScore: Number(r.exam_score) || 0,
    remark: r.remark || undefined,
  }));
}
