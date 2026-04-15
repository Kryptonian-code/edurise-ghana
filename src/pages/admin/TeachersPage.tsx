import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Eye, Edit, Trash2, GraduationCap } from "lucide-react";
import { teachers as demoTeachers, Teacher } from "@/lib/demo-data";
import { toast } from "sonner";

export default function TeachersPage() {
  const [teacherList, setTeacherList] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem("pa_teachers");
    return saved ? JSON.parse(saved) : demoTeachers;
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewTeacher, setViewTeacher] = useState<Teacher | null>(null);
  const [editTeacher, setEditTeacher] = useState<Partial<Teacher> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  const persist = (list: Teacher[]) => {
    setTeacherList(list);
    localStorage.setItem("pa_teachers", JSON.stringify(list));
  };

  const openNew = () => {
    setEditTeacher({ name: "", subject: "", classes: [], phone: "", email: "", qualification: "" });
    setDialogOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditTeacher({ ...t });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editTeacher?.name || !editTeacher?.subject) {
      toast.error("Please fill in name and subject.");
      return;
    }
    if (editTeacher.id) {
      const updated = teacherList.map(t => t.id === editTeacher.id ? { ...t, ...editTeacher } as Teacher : t);
      persist(updated);
      toast.success("Teacher record updated.");
    } else {
      const newTeacher = { ...editTeacher, id: Date.now().toString(), classes: editTeacher.classes || [] } as Teacher;
      persist([newTeacher, ...teacherList]);
      toast.success("Teacher added successfully.");
    }
    setDialogOpen(false);
    setEditTeacher(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    persist(teacherList.filter(t => t.id !== deleteTarget.id));
    toast.success(`${deleteTarget.name} has been removed.`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-header">Teachers</h1>
          <p className="text-sm text-muted-foreground">{teacherList.length} teachers on staff</p>
        </div>
        <Button className="font-semibold" onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Teacher</Button>
      </div>

      {teacherList.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-2">No Teachers Added Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Click 'Add Teacher' to register your first staff member.</p>
            <Button onClick={openNew}>Add Teacher</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardContent className="p-4 overflow-x-auto -mx-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="hidden md:table-cell">Classes</TableHead>
                    <TableHead className="hidden lg:table-cell">Qualification</TableHead>
                    <TableHead className="hidden sm:table-cell">Phone</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherList.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium whitespace-nowrap">{t.name}</TableCell>
                      <TableCell>{t.subject}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{t.classes.join(", ")}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{t.qualification}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{t.phone}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewTeacher(t)} title="View"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)} title="Edit"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(t)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTeacher?.id ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
            <DialogDescription>{editTeacher?.id ? "Update the teacher's information." : "Fill in the teacher's details below."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Full Name *</Label><Input value={editTeacher?.name || ""} onChange={e => setEditTeacher(prev => ({ ...prev!, name: e.target.value }))} className="mt-1" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Subject *</Label><Input value={editTeacher?.subject || ""} onChange={e => setEditTeacher(prev => ({ ...prev!, subject: e.target.value }))} className="mt-1" /></div>
              <div><Label>Qualification</Label><Input value={editTeacher?.qualification || ""} onChange={e => setEditTeacher(prev => ({ ...prev!, qualification: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={editTeacher?.phone || ""} onChange={e => setEditTeacher(prev => ({ ...prev!, phone: e.target.value }))} className="mt-1" placeholder="+233 XX XXX XXXX" /></div>
              <div><Label>Email</Label><Input value={editTeacher?.email || ""} onChange={e => setEditTeacher(prev => ({ ...prev!, email: e.target.value }))} className="mt-1" /></div>
            </div>
            <div>
              <Label>Assigned Classes</Label>
              <Input value={editTeacher?.classes?.join(", ") || ""} onChange={e => setEditTeacher(prev => ({ ...prev!, classes: e.target.value.split(",").map(c => c.trim()).filter(Boolean) }))} className="mt-1" placeholder="e.g. JHS 1, JHS 2, JHS 3" />
              <p className="text-xs text-muted-foreground mt-1">Separate classes with commas</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editTeacher?.id ? "Save Changes" : "Add Teacher"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewTeacher} onOpenChange={() => setViewTeacher(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Teacher Profile</DialogTitle></DialogHeader>
          {viewTeacher && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                  {viewTeacher.name.split(" ").map(w => w[0]).join("")}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-foreground truncate">{viewTeacher.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewTeacher.subject} • {viewTeacher.qualification}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{viewTeacher.phone || "—"}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="font-medium text-xs break-all">{viewTeacher.email || "—"}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Assigned Classes</p><p className="font-medium">{viewTeacher.classes.length > 0 ? viewTeacher.classes.join(", ") : "None assigned"}</p></div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setViewTeacher(null)}>Close</Button>
            <Button onClick={() => { if (viewTeacher) { openEdit(viewTeacher); setViewTeacher(null); } }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Teacher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteTarget?.name} from the system? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove Teacher</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
