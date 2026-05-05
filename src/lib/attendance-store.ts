import { supabase } from "@/integrations/supabase/client";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRow {
  id: string;
  studentId: string;
  classId: string | null;
  date: string;
  status: AttendanceStatus;
  remark?: string | null;
}

export async function listAttendance(classId: string, date: string): Promise<AttendanceRow[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("class_id", classId)
    .eq("date", date);
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id, studentId: r.student_id, classId: r.class_id, date: r.date, status: r.status, remark: r.remark,
  }));
}

export async function upsertAttendance(records: { studentId: string; classId: string; date: string; status: AttendanceStatus; remark?: string }[]): Promise<void> {
  if (records.length === 0) return;
  const { data: { user } } = await supabase.auth.getUser();
  // Delete existing rows for this class/date for these students, then insert (simple, avoids unique-key requirement)
  const studentIds = records.map(r => r.studentId);
  const classId = records[0].classId;
  const date = records[0].date;
  await supabase.from("attendance").delete().eq("class_id", classId).eq("date", date).in("student_id", studentIds);
  const payload = records.map(r => ({
    student_id: r.studentId,
    class_id: r.classId,
    date: r.date,
    status: r.status,
    remark: r.remark || null,
    recorded_by: user?.id || null,
  }));
  const { error } = await supabase.from("attendance").insert(payload);
  if (error) throw error;
}

export async function studentAttendanceSummary(studentId: string): Promise<{ total: number; present: number; rate: number }> {
  const { data, error } = await supabase
    .from("attendance")
    .select("status")
    .eq("student_id", studentId);
  if (error) throw error;
  const total = (data || []).length;
  const present = (data || []).filter((r: any) => r.status === "present").length;
  return { total, present, rate: total === 0 ? 0 : Math.round((present / total) * 100) };
}
