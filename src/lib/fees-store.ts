import { supabase } from "@/integrations/supabase/client";

export type FeeStatus = "unpaid" | "partial" | "paid";

export interface FeeInvoice {
  id: string;
  studentId: string;
  studentName?: string;
  className?: string;
  academicYear: string;
  term: string;
  description: string;
  amount: number;
  amountPaid: number;
  status: FeeStatus;
  dueDate?: string | null;
}

function fromRow(r: any): FeeInvoice {
  const amount = Number(r.amount);
  const paid = Number(r.amount_paid);
  return {
    id: r.id,
    studentId: r.student_id,
    studentName: r.students ? `${r.students.first_name} ${r.students.last_name}` : undefined,
    className: r.students?.classes?.name,
    academicYear: r.academic_year,
    term: r.term,
    description: r.description,
    amount,
    amountPaid: paid,
    status: r.status,
    dueDate: r.due_date,
  };
}

export async function listFees(): Promise<FeeInvoice[]> {
  const { data, error } = await supabase
    .from("fees")
    .select("*, students(first_name,last_name,classes(name))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createInvoice(input: {
  studentId: string; academicYear: string; term: string;
  description: string; amount: number; dueDate?: string;
}): Promise<FeeInvoice> {
  const { data, error } = await supabase
    .from("fees")
    .insert({
      student_id: input.studentId,
      academic_year: input.academicYear,
      term: input.term,
      description: input.description,
      amount: input.amount,
      due_date: input.dueDate || null,
    })
    .select("*, students(first_name,last_name,classes(name))")
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function recordPayment(input: {
  feeId: string; amount: number; method: string; reference?: string;
}): Promise<FeeInvoice> {
  const { data: { user } } = await supabase.auth.getUser();
  // Insert payment
  const { error: pErr } = await supabase.from("fee_payments").insert({
    fee_id: input.feeId,
    amount: input.amount,
    method: input.method,
    reference: input.reference || null,
    recorded_by: user?.id || null,
  });
  if (pErr) throw pErr;

  // Recalculate amount_paid + status
  const { data: fee, error: fErr } = await supabase.from("fees").select("amount").eq("id", input.feeId).single();
  if (fErr) throw fErr;
  const { data: payments, error: psErr } = await supabase.from("fee_payments").select("amount").eq("fee_id", input.feeId);
  if (psErr) throw psErr;
  const paid = (payments || []).reduce((s: number, p: any) => s + Number(p.amount), 0);
  const total = Number(fee.amount);
  const status: FeeStatus = paid >= total ? "paid" : paid > 0 ? "partial" : "unpaid";

  const { data: updated, error: uErr } = await supabase
    .from("fees")
    .update({ amount_paid: paid, status })
    .eq("id", input.feeId)
    .select("*, students(first_name,last_name,classes(name))")
    .single();
  if (uErr) throw uErr;
  return fromRow(updated);
}

export async function listFeesForStudent(studentId: string): Promise<FeeInvoice[]> {
  const { data, error } = await supabase
    .from("fees")
    .select("*, students(first_name,last_name,classes(name))")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}
