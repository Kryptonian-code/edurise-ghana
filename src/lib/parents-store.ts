import { supabase } from "@/integrations/supabase/client";

export interface ParentProfile {
  userId: string;
  fullName: string | null;
  phone: string | null;
}

export interface ParentLink {
  id: string;
  parentId: string;
  parentName: string | null;
  studentId: string;
  studentName: string;
  className?: string;
  relationship: string;
}

export async function listParents(): Promise<ParentProfile[]> {
  const { data: roles, error } = await supabase.from("user_roles").select("user_id").eq("role", "parent");
  if (error) throw error;
  const userIds = Array.from(new Set((roles || []).map((r: any) => r.user_id)));
  if (userIds.length === 0) return [];
  const { data: profiles } = await supabase.from("profiles").select("user_id,full_name,phone").in("user_id", userIds);
  return userIds.map(uid => {
    const p = (profiles || []).find((x: any) => x.user_id === uid);
    return { userId: uid, fullName: p?.full_name ?? null, phone: p?.phone ?? null };
  });
}

export async function listParentLinks(): Promise<ParentLink[]> {
  const { data, error } = await supabase
    .from("parent_students")
    .select("id,parent_id,relationship,student_id,students(first_name,last_name,classes(name))");
  if (error) throw error;
  const rows = data || [];
  const parentIds = Array.from(new Set(rows.map((r: any) => r.parent_id)));
  const { data: profiles } = parentIds.length
    ? await supabase.from("profiles").select("user_id,full_name").in("user_id", parentIds)
    : { data: [] as any[] };
  return rows.map((r: any) => ({
    id: r.id,
    parentId: r.parent_id,
    parentName: (profiles || []).find((p: any) => p.user_id === r.parent_id)?.full_name ?? null,
    studentId: r.student_id,
    studentName: r.students ? `${r.students.first_name} ${r.students.last_name}` : "Unknown",
    className: r.students?.classes?.name,
    relationship: r.relationship,
  }));
}

export async function linkParentToStudent(parentId: string, studentId: string, relationship: string): Promise<void> {
  const { error } = await supabase.from("parent_students").insert({
    parent_id: parentId, student_id: studentId, relationship,
  });
  if (error) throw error;
}

export async function unlinkParentStudent(id: string): Promise<void> {
  const { error } = await supabase.from("parent_students").delete().eq("id", id);
  if (error) throw error;
}

export async function listMyChildren(): Promise<{ id: string; firstName: string; lastName: string; className?: string }[]> {
  const { data, error } = await supabase
    .from("parent_students")
    .select("students(id,first_name,last_name,classes(name))");
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.students.id,
    firstName: r.students.first_name,
    lastName: r.students.last_name,
    className: r.students.classes?.name,
  }));
}
