import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Eye, Edit } from "lucide-react";
import { teachers as demoTeachers, Teacher } from "@/lib/demo-data";
import { toast } from "sonner";

export default function TeachersPage() {
  const [teacherList, setTeacherList] = useState<Teacher[]>(demoTeachers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewTeacher, setViewTeacher] = useState<Teacher | null>(null);
  const [editTeacher, setEditTeacher] = useState<Partial<Teacher> | null>(null);

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
      setTeacherList(prev => prev.map(t => t.id === editTeacher.id ? { ...t, ...editTeacher } as Teacher : t));
      toast.success("Teacher updated!");
    } else {
      setTeacherList(prev => [{ ...editTeacher, id: Date.now().toString(), classes: editTeacher.classes || [] } as Teacher, ...prev]);
      toast.success("Teacher added!");
    }
    setDialogOpen(false);
    setEditTeacher(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="dashboard-header">Teachers</h1>
          <p className="text-sm text-muted-foreground">{teacherList.length} teachers</p>
        </div>
        <Button className="font-semibold" onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Teacher</Button>
      </div>
      <Card className="border-border">
        <CardContent className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teacherList.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No teachers yet. Click 'Add Teacher' to get started.</TableCell></TableRow>
              ) : teacherList.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell className="text-sm">{t.classes.join(", ")}</TableCell>
                  <TableCell className="text-sm">{t.qualification}</TableCell>
                  <TableCell className="text-sm">{t.phone}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewTeacher(t)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}><Edit className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTeacher?.id ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Full Name *</Label><Input value={editTeacher?.name || ""} onChange={e => setEditTeacher(prev => ({ ...prev!, name: e.target.value }))} className="mt-1" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Subject *</Label><Input value={editTeacher?.subject || ""} onChange={e => setEditTeacher(prev => ({ ...prev!, subject: e.target.value }))} className="mt-1" /></div>
              <div><Label>Qualification</Label><Input value={editTeacher?.qualification || ""} onChange={e => setEditTeacher(prev => ({ ...prev!, qualification: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={editTeacher?.phone || ""} onChange={e => setEditTeacher(prev => ({ ...prev!, phone: e.target.value }))} className="mt-1" placeholder="+233 XX XXX XXXX" /></div>
              <div><Label>Email</Label><Input value={editTeacher?.email || ""} onChange={e => setEditTeacher(prev => ({ ...prev!, email: e.target.value }))} className="mt-1" /></div>
            </div>
            <div><Label>Assigned Classes</Label><Input value={editTeacher?.classes?.join(", ") || ""} onChange={e => setEditTeacher(prev => ({ ...prev!, classes: e.target.value.split(",").map(c => c.trim()).filter(Boolean) }))} className="mt-1" placeholder="e.g. JHS 1, JHS 2, JHS 3" /><p className="text-xs text-muted-foreground mt-1">Separate classes with commas</p></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editTeacher?.id ? "Update Teacher" : "Add Teacher"}</Button>
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
                <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center text-xl font-bold text-primary">
                  {viewTeacher.name.split(" ").map(w => w[0]).join("")}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{viewTeacher.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewTeacher.subject} • {viewTeacher.qualification}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{viewTeacher.phone}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="font-medium text-xs">{viewTeacher.email}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Classes</p><p className="font-medium">{viewTeacher.classes.join(", ")}</p></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTeacher(null)}>Close</Button>
            <Button onClick={() => { if (viewTeacher) { openEdit(viewTeacher); setViewTeacher(null); } }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
