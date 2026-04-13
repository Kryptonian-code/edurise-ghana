import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Eye, FileText } from "lucide-react";
import { admissionApplications } from "@/lib/demo-data";
import { toast } from "sonner";

export default function AdminAdmissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-header">Admissions Management</h1>
        <p className="text-sm text-muted-foreground">Review and process admission applications</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Applications", value: admissionApplications.length },
          { label: "Pending Review", value: admissionApplications.filter(a => a.status === "Pending" || a.status === "Under Review").length },
          { label: "Approved", value: admissionApplications.filter(a => a.status === "Approved").length },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardContent className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child's Name</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Class Applied</TableHead>
                <TableHead>Previous School</TableHead>
                <TableHead>Date Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admissionApplications.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.childName}</TableCell>
                  <TableCell>{a.parentName}</TableCell>
                  <TableCell>{a.classApplied}</TableCell>
                  <TableCell>{a.previousSchool}</TableCell>
                  <TableCell>{new Date(a.dateApplied).toLocaleDateString("en-GB")}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === "Approved" ? "default" : "secondary"} className="text-xs">{a.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success("Application approved")}><CheckCircle className="h-4 w-4 text-success" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><XCircle className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
