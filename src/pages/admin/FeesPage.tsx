import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Download, Plus } from "lucide-react";
import { feeRecords as demoFees, stats, FeeRecord } from "@/lib/demo-data";
import { toast } from "sonner";

export default function FeesPage() {
  const [records, setRecords] = useState<FeeRecord[]>(demoFees);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ studentName: "", class: "", feeType: "Tuition", amount: "", paymentMethod: "Mobile Money", momoRef: "" });

  const handleRecordPayment = () => {
    if (!paymentForm.studentName || !paymentForm.amount) {
      toast.error("Please fill in student name and payment amount.");
      return;
    }
    const amount = parseFloat(paymentForm.amount);
    // Find existing record for student or create new
    const existing = records.find(r => r.studentName === paymentForm.studentName && r.feeType === paymentForm.feeType);
    if (existing) {
      setRecords(prev => prev.map(r => r.id === existing.id ? {
        ...r,
        paid: r.paid + amount,
        balance: Math.max(0, r.balance - amount),
        status: (r.balance - amount <= 0 ? "Paid" : "Partial") as FeeRecord["status"],
        lastPaymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: paymentForm.paymentMethod,
        momoRef: paymentForm.momoRef || undefined,
      } : r));
    } else {
      const newRecord: FeeRecord = {
        id: Date.now().toString(),
        studentId: Date.now().toString(),
        studentName: paymentForm.studentName,
        class: paymentForm.class,
        feeType: paymentForm.feeType,
        amount: amount,
        paid: amount,
        balance: 0,
        status: "Paid",
        term: "Term 1, 2024/2025",
        dueDate: new Date().toISOString().split("T")[0],
        lastPaymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: paymentForm.paymentMethod,
        momoRef: paymentForm.momoRef || undefined,
      };
      setRecords(prev => [newRecord, ...prev]);
    }
    toast.success("Payment recorded successfully!");
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
          { label: "Total Billed", value: `₵${(totalBilled / 1000).toFixed(0)}K`, sub: "This academic year" },
          { label: "Total Collected", value: `₵${(totalPaid / 1000).toFixed(0)}K`, sub: `${Math.round((totalPaid / totalBilled) * 100)}% collection rate` },
          { label: "Outstanding", value: `₵${(totalOutstanding / 1000).toFixed(0)}K`, sub: `${debtorCount} students owing` },
          { label: "Debtors", value: debtorCount.toString(), sub: "Require follow-up" },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardContent className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Amount (₵)</TableHead>
                <TableHead>Paid (₵)</TableHead>
                <TableHead>Balance (₵)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No fee records yet.</TableCell></TableRow>
              ) : records.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.studentName}</TableCell>
                  <TableCell>{f.class}</TableCell>
                  <TableCell>{f.feeType}</TableCell>
                  <TableCell>{f.amount.toLocaleString()}</TableCell>
                  <TableCell>{f.paid.toLocaleString()}</TableCell>
                  <TableCell className={f.balance > 0 ? "text-destructive font-semibold" : "text-success font-semibold"}>
                    {f.balance.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={f.status === "Paid" ? "default" : f.status === "Partial" ? "secondary" : "destructive"} className="text-xs">
                      {f.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{f.paymentMethod || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
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
            <div><Label>Amount (GHS) *</Label><Input type="number" value={paymentForm.amount} onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))} className="mt-1" placeholder="e.g. 1500" /></div>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
