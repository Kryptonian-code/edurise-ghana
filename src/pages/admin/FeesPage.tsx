import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Download, AlertTriangle } from "lucide-react";
import { feeRecords, stats } from "@/lib/demo-data";

export default function FeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-header">Fees & Billing</h1>
          <p className="text-sm text-muted-foreground">Manage student fees, payments, and invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="font-semibold"><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button className="font-semibold"><DollarSign className="h-4 w-4 mr-2" />Record Payment</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Billed", value: `₵${(stats.totalRevenue / 1000).toFixed(0)}K`, sub: "This academic year" },
          { label: "Total Collected", value: `₵${((stats.totalRevenue - stats.outstandingFees) / 1000).toFixed(0)}K`, sub: "86% collection rate" },
          { label: "Outstanding", value: `₵${(stats.outstandingFees / 1000).toFixed(0)}K`, sub: `${feeRecords.filter(f => f.balance > 0).length} students owing` },
          { label: "Debtors", value: feeRecords.filter(f => f.balance > 0).length.toString(), sub: "Require follow-up" },
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
              {feeRecords.map(f => (
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
    </div>
  );
}
