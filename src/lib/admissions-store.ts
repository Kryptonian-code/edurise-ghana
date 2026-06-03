import { supabase } from "@/integrations/supabase/client";

export type AdmissionStatus = "Pending" | "Under Review" | "Approved" | "Rejected";

export interface AdmissionApplication {
  id: string;
  childName: string;
  childDob?: string | null;
  gender?: string | null;
  classApplied: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string | null;
  previousSchool?: string | null;
  notes?: string | null;
  status: AdmissionStatus;
  dateApplied: string;
  reviewedAt?: string | null;
}

export interface SubmitAdmissionInput {
  childName: string;
  childDob?: string | null;
  gender?: string | null;
  classApplied: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string | null;
  previousSchool?: string | null;
  notes?: string | null;
}

function mapApplication(row: any): AdmissionApplication {
  return {
    id: row.id,
    childName: row.child_name,
    childDob: row.child_dob,
    gender: row.gender,
    classApplied: row.class_applied,
    parentName: row.parent_name,
    parentPhone: row.parent_phone,
    parentEmail: row.parent_email,
    previousSchool: row.previous_school,
    notes: row.notes,
    status: row.status,
    dateApplied: row.submitted_at,
    reviewedAt: row.reviewed_at,
  };
}

export async function listApplications(): Promise<AdmissionApplication[]> {
  const { data, error } = await supabase
    .from("admission_applications")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapApplication);
}

export async function submitApplication(input: SubmitAdmissionInput): Promise<void> {
  const { error } = await supabase.from("admission_applications").insert({
    child_name: input.childName,
    child_dob: input.childDob || null,
    gender: input.gender || null,
    class_applied: input.classApplied,
    parent_name: input.parentName,
    parent_phone: input.parentPhone,
    parent_email: input.parentEmail || null,
    previous_school: input.previousSchool || null,
    notes: input.notes || null,
  });

  if (error) throw error;
}

export async function updateApplicationStatus(id: string, status: AdmissionStatus): Promise<AdmissionApplication> {
  const { data, error } = await supabase
    .from("admission_applications")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapApplication(data);
}