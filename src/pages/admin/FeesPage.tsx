import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Download, Plus } from "lucide-react";
import { feeRecords as demoFees, FeeRecord } from "@/lib/demo-data";
import { toast } from "sonner";

export default function FeesPage() {
  const [records, setRecords] = useState<FeeRecord[]>(() => {
    const saved = localStorage.getItem("pa_fees");
    return saved ? JSON.parse(saved) : demoFees;
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ studentName: "", class: "", feeType: "Tuition", amount: "", paymentMethod: "Mobile Money", momoRef: "" });

  const persist = (list: FeeRecord[]) => {
    setRecords(list);
    localStorage.setItem("pa_fees", JSON.stringify(list));
  };

  const handleRecordPayment = () => {
    if (!paymentForm.studentName || !paymentForm.amount) {
      toast.error("Please fill in student name and payment amount.");
      return;
    }
    const amount = parseFloat(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    const existing = records.find(r => r.studentName === paymentForm.studentName && r.feeType === paymentForm.feeType);
    let updated: FeeRecord[];
    if (existing) {
      updated = records.map(r => r.id === existing.id ? {
        ...r,
        paid: r.paid + amount,
        balance: Math.max(0, r.balance - amount),
        status: (r.balance - amount <= 0 ? "Paid" : "Partial") as FeeRecord["status"],
        lastPaymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: paymentForm.paymentMethod,
        momoRef: paymentForm.momoRef || undefined,
      } : r);
    } else {
      const newRecord: FeeRecord = {
        id: Date.now().toString(),
        studentId: Date.now().toString(),
        studentName: paymentForm.studentName,
        class: paymentForm.class,
        feeType: paymentForm.feeType,
        amount,
        paid: amount,
        balance: 0,
        status: "Paid",
        term: "Term 1, 2024/2025",
        dueDate: new Date().toISOString().split("T")[0],
        lastPaymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: paymentForm.paymentMethod,
        momoRef: paymentForm.momoRef || undefined,
      };
      updated = [newRecord, ...records];
    }
    persist(updated);
    toast.success("Payment recorded successfully.");
    setDialogOpen(false);
    setPaymentForm({ studentName: "", class: "", feeType: "Tuition", amount: "", paymentMethod: "Mobile Money", momoRef: "" });
  };

  const totalBilled = records.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = records.reduce((sum, f) => sum + f.paid, 0);
  const totalOutstanding = records.reduce((sum, f) => sum + f.balance, 0);
  const debtorCount = records.filter(f => f.balance > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-header">Fees & Billing</h1>
          <p className="text-sm text-muted-foreground">Manage student fees, payments, and invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="font-semibold"><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button className="font-semibold" onClick={() => setDialogOpen(true)}><DollarSign className="h-4 w-4 mr-2" />Record Payment</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Billed", value: `₵${totalBilled.toLocaleString()}`, sub: "This academic year" },
          { label: "Total Collected", value: `₵${totalPaid.toLocaleString()}`, sub: totalBilled > 0 ? `${Math.round((totalPaid / totalBilled) * 100)}% collection rate` : "—" },
          { label: "Outstanding", value: `₵${totalOutstanding.toLocaleString()}`, sub: `${debtorCount} student${debtorCount !== 1 ? "s" : ""} owing` },
          { label: "Debtors", value: debtorCount.toString(), sub: "Require follow-up" },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <CardContent className="p-4">
              <p className="text-xl sm:text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardContent className="p-4">
          {records.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-bold text-foreground mb-2">No Fee Records Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Click 'Record Payment' to add the first transaction.</p>
              <Button onClick={() => setDialogOpen(true)}>Record Payment</Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden sm:table-cell">Class</TableHead>
                    <TableHead className="hidden md:table-cell">Fee Type</TableHead>
                    <TableHead>Amount (₵)</TableHead>
                    <TableHead className="hidden sm:table-cell">Paid (₵)</TableHead>
                    <TableHead>Balance (₵)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Payment Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map(f => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium whitespace-nowrap">{f.studentName}</TableCell>
                      <TableCell className="hidden sm:table-cell">{f.class}</TableCell>
                      <TableCell className="hidden md:table-cell">{f.feeType}</TableCell>
                      <TableCell>{f.amount.toLocaleString()}</TableCell>
                      <TableCell className="hidden sm:table-cell">{f.paid.toLocaleString()}</TableCell>
                      <TableCell className={f.balance > 0 ? "text-destructive font-semibold" : "text-success font-semibold"}>
                        {f.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={f.status === "Paid" ? "default" : f.status === "Partial" ? "secondary" : "destructive"} className="text-xs">
                          {f.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{f.paymentMethod || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Enter the payment details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Student Name *</Label><Input value={paymentForm.studentName} onChange={e => setPaymentForm(p => ({ ...p, studentName: e.target.value }))} className="mt-1" placeholder="e.g. Kwame Asante" /></div>
            <div><Label>Class</Label><Input value={paymentForm.class} onChange={e => setPaymentForm(p => ({ ...p, class: e.target.value }))} className="mt-1" placeholder="e.g. JHS 2" /></div>
            <div>
              <Label>Fee Type</Label>
              <Select value={paymentForm.feeType} onValueChange={v => setPaymentForm(p => ({ ...p, feeType: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Tuition", "Tuition + Feeding", "Tuition + Boarding", "Feeding", "Transport", "PTA Dues", "Exam Fees", "Books & Uniform"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Amount (GHS) *</Label><Input type="number" min="0" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))} className="mt-1" placeholder="e.g. 1500" /></div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentForm.paymentMethod} onValueChange={v => setPaymentForm(p => ({ ...p, paymentMethod: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Mobile Money", "Bank Transfer", "Cash", "Cheque"].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {paymentForm.paymentMethod === "Mobile Money" && (
              <div><Label>MoMo Reference</Label><Input value={paymentForm.momoRef} onChange={e => setPaymentForm(p => ({ ...p, momoRef: e.target.value }))} className="mt-1" placeholder="Transaction reference" /></div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
