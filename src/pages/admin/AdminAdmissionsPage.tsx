import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, FileText } from "lucide-react";
import { admissionApplications as demoApps } from "@/lib/demo-data";
import { toast } from "sonner";

export default function AdminAdmissionsPage() {
  const [apps, setApps] = useState(() => {
    const saved = localStorage.getItem("pa_admissions");
    return saved ? JSON.parse(saved) : demoApps;
  });
  const [viewApp, setViewApp] = useState<typeof demoApps[0] | null>(null);

  const persist = (list: typeof demoApps) => {
    setApps(list);
    localStorage.setItem("pa_admissions", JSON.stringify(list));
  };

  const updateStatus = (id: string, status: string) => {
    const updated = apps.map((a: typeof demoApps[0]) => a.id === id ? { ...a, status } : a);
    persist(updated);
    toast.success(`Application ${status.toLowerCase()}.`);
    setViewApp(null);
  };

  const pending = apps.filter((a: any) => a.status === "Pending" || a.status === "Under Review").length;
  const approved = apps.filter((a: any) => a.status === "Approved").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-header">Admissions Management</h1>
        <p className="text-sm text-muted-foreground">Review and process admission applications</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Applications", value: apps.length },
          { label: "Pending Review", value: pending },
          { label: "Approved", value: approved },
        ].map((s: any) => (
          <Card key={s.label} className="stat-card">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {apps.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-2">No Applications Received</h3>
            <p className="text-sm text-muted-foreground">Applications submitted through the public admissions page will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="overflow-x-auto -mx-4 px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Child's Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Parent</TableHead>
                    <TableHead>Class Applied</TableHead>
                    <TableHead className="hidden md:table-cell">Previous School</TableHead>
                    <TableHead className="hidden lg:table-cell">Date Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apps.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium whitespace-nowrap">{a.childName}</TableCell>
                      <TableCell className="hidden sm:table-cell">{a.parentName}</TableCell>
                      <TableCell>{a.classApplied}</TableCell>
                      <TableCell className="hidden md:table-cell">{a.previousSchool}</TableCell>
                      <TableCell className="hidden lg:table-cell">{new Date(a.dateApplied).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell>
                        <Badge variant={a.status === "Approved" ? "default" : a.status === "Rejected" ? "destructive" : "secondary"} className="text-xs">{a.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewApp(a)} title="View"><Eye className="h-4 w-4" /></Button>
                          {a.status !== "Approved" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateStatus(a.id, "Approved")} title="Approve"><CheckCircle className="h-4 w-4 text-success" /></Button>
                          )}
                          {a.status !== "Rejected" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateStatus(a.id, "Rejected")} title="Reject"><XCircle className="h-4 w-4 text-destructive" /></Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Application Dialog */}
      <Dialog open={!!viewApp} onOpenChange={() => setViewApp(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Application Details</DialogTitle></DialogHeader>
          {viewApp && (
            <div className="space-y-3 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Child's Name</p><p className="font-medium">{viewApp.childName}</p></div>
                <div><p className="text-muted-foreground">Class Applied</p><p className="font-medium">{viewApp.classApplied}</p></div>
                <div><p className="text-muted-foreground">Parent/Guardian</p><p className="font-medium">{viewApp.parentName}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{viewApp.parentPhone}</p></div>
                <div><p className="text-muted-foreground">Previous School</p><p className="font-medium">{viewApp.previousSchool}</p></div>
                <div><p className="text-muted-foreground">Date Applied</p><p className="font-medium">{new Date(viewApp.dateApplied).toLocaleDateString("en-GB")}</p></div>
                <div><p className="text-muted-foreground">Status</p><Badge variant={viewApp.status === "Approved" ? "default" : "secondary"} className="text-xs">{viewApp.status}</Badge></div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => setViewApp(null)}>Close</Button>
            {viewApp && viewApp.status !== "Approved" && (
              <Button onClick={() => updateStatus(viewApp.id, "Approved")}>Approve Application</Button>
            )}
            {viewApp && viewApp.status !== "Rejected" && (
              <Button variant="destructive" onClick={() => updateStatus(viewApp.id, "Rejected")}>Reject</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
