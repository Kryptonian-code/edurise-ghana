import { supabase } from "@/integrations/supabase/client";

export interface TeacherProfile {
  userId: string;
  fullName: string | null;
  phone: string | null;
  assignments: { id: string; classId: string; className: string; subject: string | null }[];
}

export async function listTeachers(): Promise<TeacherProfile[]> {
  // 1. Get all user_ids that have the teacher role
  const { data: roles, error: rErr } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "teacher");
  if (rErr) throw rErr;
  const userIds = Array.from(new Set((roles || []).map((r: any) => r.user_id)));
  if (userIds.length === 0) return [];

  const [{ data: profiles }, { data: assignments }] = await Promise.all([
    supabase.from("profiles").select("user_id,full_name,phone").in("user_id", userIds),
    supabase.from("teacher_classes").select("id,teacher_id,class_id,subject,classes(name)").in("teacher_id", userIds),
  ]);

  return userIds.map(uid => {
    const p = (profiles || []).find((x: any) => x.user_id === uid);
    const mine = (assignments || []).filter((a: any) => a.teacher_id === uid);
    return {
      userId: uid,
      fullName: p?.full_name ?? null,
      phone: p?.phone ?? null,
      assignments: mine.map((a: any) => ({
        id: a.id,
        classId: a.class_id,
        className: a.classes?.name || "Unknown",
        subject: a.subject,
      })),
    };
  });
}

export async function assignTeacherToClass(teacherId: string, classId: string, subject?: string): Promise<void> {
  const { error } = await supabase.from("teacher_classes").insert({
    teacher_id: teacherId,
    class_id: classId,
    subject: subject || null,
  });
  if (error) throw error;
}

export async function unassignTeacherClass(assignmentId: string): Promise<void> {
  const { error } = await supabase.from("teacher_classes").delete().eq("id", assignmentId);
  if (error) throw error;
}
