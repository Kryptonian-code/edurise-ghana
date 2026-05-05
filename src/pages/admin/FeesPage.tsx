import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Plus, Loader2, Receipt } from "lucide-react";
import { toast } from "sonner";
import { createInvoice, FeeInvoice, listFees, recordPayment } from "@/lib/fees-store";
import { listStudents, StudentRow, currentAcademicYear } from "@/lib/students-store";

const TERMS = ["Term 1", "Term 2", "Term 3"];
const METHODS = ["Mobile Money", "Bank Transfer", "Cash", "Cheque"];

export default function FeesPage() {
  const [records, setRecords] = useState<FeeInvoice[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState<FeeInvoice | null>(null);
  const [saving, setSaving] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({
    studentId: "", description: "School Fees",
    amount: "", term: "Term 1", academicYear: currentAcademicYear(), dueDate: "",
  });
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "Mobile Money", reference: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [f, s] = await Promise.all([listFees(), listStudents()]);
      setRecords(f); setStudents(s);
    } catch (e: any) { toast.error(e.message || "Failed to load"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const totals = useMemo(() => {
    const billed = records.reduce((s, r) => s + r.amount, 0);
    const paid = records.reduce((s, r) => s + r.amountPaid, 0);
    const out = billed - paid;
    const debtors = records.filter(r => r.status !== "paid").length;
    return { billed, paid, out, debtors };
  }, [records]);

  const handleCreateInvoice = async () => {
    if (!invoiceForm.studentId || !invoiceForm.amount) { toast.error("Select student and amount"); return; }
    const amt = parseFloat(invoiceForm.amount);
    if (!Number.isFinite(amt) || amt <= 0) { toast.error("Enter a valid amount"); return; }
    setSaving(true);
    try {
      const row = await createInvoice({
        studentId: invoiceForm.studentId,
        description: invoiceForm.description,
        amount: amt,
        term: invoiceForm.term,
        academicYear: invoiceForm.academicYear,
        dueDate: invoiceForm.dueDate || undefined,
      });
      setRecords(prev => [row, ...prev]);
      toast.success("Invoice created");
      setInvoiceOpen(false);
      setInvoiceForm({ studentId: "", description: "School Fees", amount: "", term: "Term 1", academicYear: currentAcademicYear(), dueDate: "" });
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleRecordPayment = async () => {
    if (!paymentOpen) return;
    const amt = parseFloat(paymentForm.amount);
    if (!Number.isFinite(amt) || amt <= 0) { toast.error("Enter a valid amount"); return; }
    setSaving(true);
    try {
      const updated = await recordPayment({ feeId: paymentOpen.id, amount: amt, method: paymentForm.method, reference: paymentForm.reference });
      setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
      toast.success("Payment recorded");
      setPaymentOpen(null);
      setPaymentForm({ amount: "", method: "Mobile Money", reference: "" });
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-header">Fees & Billing</h1>
          <p className="text-sm text-muted-foreground">Manage student invoices and payments</p>
        </div>
        <Button className="font-semibold" onClick={() => setInvoiceOpen(true)}><Plus className="h-4 w-4 mr-2" />New Invoice</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Billed", value: `₵${totals.billed.toLocaleString()}` },
          { label: "Total Collected", value: `₵${totals.paid.toLocaleString()}`, sub: totals.billed > 0 ? `${Math.round((totals.paid / totals.billed) * 100)}% collection` : "—" },
          { label: "Outstanding", value: `₵${totals.out.toLocaleString()}` },
          { label: "Debtors", value: totals.debtors.toString(), sub: "Unpaid invoices" },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <CardContent className="p-4">
              <p className="text-xl sm:text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              {s.sub && <p className="text-xs text-muted-foreground">{s.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardContent className="p-4">
          {records.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-bold text-foreground mb-2">No Invoices Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first invoice to start tracking fees.</p>
              <Button onClick={() => setInvoiceOpen(true)}>New Invoice</Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden sm:table-cell">Class</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="hidden md:table-cell">Term</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden sm:table-cell">Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map(f => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium whitespace-nowrap">{f.studentName}</TableCell>
                      <TableCell className="hidden sm:table-cell">{f.className || "—"}</TableCell>
                      <TableCell className="hidden md:table-cell">{f.description}</TableCell>
                      <TableCell className="hidden md:table-cell">{f.term}</TableCell>
                      <TableCell>₵{f.amount.toLocaleString()}</TableCell>
                      <TableCell className="hidden sm:table-cell">₵{f.amountPaid.toLocaleString()}</TableCell>
                      <TableCell className={(f.amount - f.amountPaid) > 0 ? "text-destructive font-semibold" : "text-success font-semibold"}>
                        ₵{(f.amount - f.amountPaid).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={f.status === "paid" ? "default" : f.status === "partial" ? "secondary" : "destructive"} className="text-xs capitalize">{f.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {f.status !== "paid" && (
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPaymentOpen(f)}>
                            <Receipt className="h-3 w-3 mr-1" />Pay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Invoice */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Invoice</DialogTitle>
            <DialogDescription>Create a fee invoice for a student.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Student *</Label>
              <Select value={invoiceForm.studentId} onValueChange={v => setInvoiceForm(p => ({ ...p, studentId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select a student" /></SelectTrigger>
                <SelectContent>
                  {students.map(s => (<SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName} {s.className ? `• ${s.className}` : ""}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Input value={invoiceForm.description} onChange={e => setInvoiceForm(p => ({ ...p, description: e.target.value }))} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount (₵) *</Label><Input type="number" min="0" step="0.01" value={invoiceForm.amount} onChange={e => setInvoiceForm(p => ({ ...p, amount: e.target.value }))} className="mt-1" /></div>
              <div><Label>Due Date</Label><Input type="date" value={invoiceForm.dueDate} onChange={e => setInvoiceForm(p => ({ ...p, dueDate: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Term</Label>
                <Select value={invoiceForm.term} onValueChange={v => setInvoiceForm(p => ({ ...p, term: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{TERMS.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><Label>Academic Year</Label><Input value={invoiceForm.academicYear} onChange={e => setInvoiceForm(p => ({ ...p, academicYear: e.target.value }))} className="mt-1" /></div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setInvoiceOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleCreateInvoice} disabled={saving}>{saving ? "Saving..." : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment */}
      <Dialog open={!!paymentOpen} onOpenChange={() => setPaymentOpen(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>{paymentOpen?.studentName} • {paymentOpen?.description} • Balance ₵{paymentOpen ? (paymentOpen.amount - paymentOpen.amountPaid).toLocaleString() : ""}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Amount (₵) *</Label><Input type="number" min="0" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))} className="mt-1" /></div>
            <div>
              <Label>Method</Label>
              <Select value={paymentForm.method} onValueChange={v => setPaymentForm(p => ({ ...p, method: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{METHODS.map(m => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><Label>Reference</Label><Input value={paymentForm.reference} onChange={e => setPaymentForm(p => ({ ...p, reference: e.target.value }))} className="mt-1" placeholder="Receipt or MoMo ref" /></div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPaymentOpen(null)} disabled={saving}>Cancel</Button>
            <Button onClick={handleRecordPayment} disabled={saving}>{saving ? "Saving..." : "Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
