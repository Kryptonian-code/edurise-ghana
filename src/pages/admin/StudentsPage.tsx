import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Eye, Edit, X } from "lucide-react";
import { students as demoStudents, Student } from "@/lib/demo-data";
import { toast } from "sonner";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>(demoStudents);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Partial<Student> | null>(null);

  const filtered = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.studentId} ${s.class}`.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditStudent({ firstName: "", lastName: "", gender: "Male", dateOfBirth: "", class: "", guardian: "", guardianPhone: "", status: "Active", feeBalance: 0, admissionDate: new Date().toISOString().split("T")[0], studentId: `PA-${new Date().getFullYear()}-${String(students.length + 1).padStart(3, "0")}` });
    setDialogOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditStudent({ ...s });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editStudent?.firstName || !editStudent?.lastName) {
      toast.error("Please fill in the student's name.");
      return;
    }
    if (editStudent.id) {
      setStudents(prev => prev.map(s => s.id === editStudent.id ? { ...s, ...editStudent } as Student : s));
      toast.success("Student updated successfully!");
    } else {
      const newStudent: Student = {
        ...(editStudent as Student),
        id: Date.now().toString(),
        studentId: editStudent.studentId || `PA-${new Date().getFullYear()}-${String(students.length + 1).padStart(3, "0")}`,
      };
      setStudents(prev => [newStudent, ...prev]);
      toast.success("Student added successfully!");
    }
    setDialogOpen(false);
    setEditStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-header">Student Management</h1>
          <p className="text-sm text-muted-foreground">{students.length} students enrolled</p>
        </div>
        <Button className="font-semibold" onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Student</Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, ID, or class..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Fee Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {search ? "No students found matching your search." : "No students yet. Click 'Add Student' to get started."}
                    </TableCell>
                  </TableRow>
                ) : filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.studentId}</TableCell>
                    <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                    <TableCell>{s.class} {s.stream && `(${s.stream})`}</TableCell>
                    <TableCell>{s.gender}</TableCell>
                    <TableCell className="text-sm">{s.guardian}</TableCell>
                    <TableCell>
                      {s.feeBalance > 0 ? (
                        <span className="text-destructive font-semibold">₵{s.feeBalance.toLocaleString()}</span>
                      ) : (
                        <span className="text-success font-semibold">Cleared</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "Active" ? "default" : "secondary"} className="text-xs">{s.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewStudent(s)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Edit className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editStudent?.id ? "Edit Student" : "Add New Student"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>First Name *</Label><Input value={editStudent?.firstName || ""} onChange={e => setEditStudent(prev => ({ ...prev!, firstName: e.target.value }))} className="mt-1" /></div>
              <div><Label>Last Name *</Label><Input value={editStudent?.lastName || ""} onChange={e => setEditStudent(prev => ({ ...prev!, lastName: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Date of Birth</Label><Input type="date" value={editStudent?.dateOfBirth || ""} onChange={e => setEditStudent(prev => ({ ...prev!, dateOfBirth: e.target.value }))} className="mt-1" /></div>
              <div>
                <Label>Gender</Label>
                <Select value={editStudent?.gender} onValueChange={v => setEditStudent(prev => ({ ...prev!, gender: v as "Male" | "Female" }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Class *</Label>
                <Select value={editStudent?.class || ""} onValueChange={v => setEditStudent(prev => ({ ...prev!, class: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {["Crèche", "Nursery 1", "Nursery 2", "KG 1", "KG 2", "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JHS 1", "JHS 2", "JHS 3", "SHS 1", "SHS 2", "SHS 3"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stream</Label>
                <Select value={editStudent?.stream || ""} onValueChange={v => setEditStudent(prev => ({ ...prev!, stream: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Guardian Name *</Label><Input value={editStudent?.guardian || ""} onChange={e => setEditStudent(prev => ({ ...prev!, guardian: e.target.value }))} className="mt-1" /></div>
              <div><Label>Guardian Phone *</Label><Input value={editStudent?.guardianPhone || ""} onChange={e => setEditStudent(prev => ({ ...prev!, guardianPhone: e.target.value }))} className="mt-1" placeholder="+233 XX XXX XXXX" /></div>
            </div>
            <div>
              <Label>Student ID</Label>
              <Input value={editStudent?.studentId || ""} readOnly className="mt-1 bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">Auto-generated. Cannot be changed.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editStudent?.id ? "Update Student" : "Add Student"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          {viewStudent && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center text-xl font-bold text-primary">
                  {viewStudent.firstName[0]}{viewStudent.lastName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{viewStudent.firstName} {viewStudent.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{viewStudent.class} {viewStudent.stream && `(${viewStudent.stream})`} • {viewStudent.studentId}</p>
                  <Badge variant={viewStudent.status === "Active" ? "default" : "secondary"} className="text-xs mt-1">{viewStudent.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Gender</p><p className="font-medium">{viewStudent.gender}</p></div>
                <div><p className="text-muted-foreground">Date of Birth</p><p className="font-medium">{new Date(viewStudent.dateOfBirth).toLocaleDateString("en-GB")}</p></div>
                <div><p className="text-muted-foreground">Admission Date</p><p className="font-medium">{new Date(viewStudent.admissionDate).toLocaleDateString("en-GB")}</p></div>
                <div><p className="text-muted-foreground">Fee Balance</p><p className={`font-bold ${viewStudent.feeBalance > 0 ? "text-destructive" : "text-success"}`}>{viewStudent.feeBalance > 0 ? `₵${viewStudent.feeBalance.toLocaleString()}` : "Cleared"}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Guardian</p><p className="font-medium">{viewStudent.guardian} • {viewStudent.guardianPhone}</p></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewStudent(null)}>Close</Button>
            <Button onClick={() => { if (viewStudent) { openEdit(viewStudent); setViewStudent(null); } }}>Edit Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
