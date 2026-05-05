import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, GraduationCap, Loader2, X, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { assignTeacherToClass, listTeachers, TeacherProfile, unassignTeacherClass } from "@/lib/teachers-store";
import { ClassRow, listClasses } from "@/lib/students-store";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignFor, setAssignFor] = useState<TeacherProfile | null>(null);
  const [assignForm, setAssignForm] = useState({ classId: "", subject: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, c] = await Promise.all([listTeachers(), listClasses()]);
      setTeachers(t); setClasses(c);
    } catch (e: any) { toast.error(e.message || "Failed to load"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleAssign = async () => {
    if (!assignFor || !assignForm.classId) { toast.error("Pick a class"); return; }
    setSaving(true);
    try {
      await assignTeacherToClass(assignFor.userId, assignForm.classId, assignForm.subject || undefined);
      toast.success("Class assigned");
      setAssignFor(null);
      setAssignForm({ classId: "", subject: "" });
      await load();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleUnassign = async (assignmentId: string) => {
    try {
      await unassignTeacherClass(assignmentId);
      toast.success("Assignment removed");
      await load();
    } catch (e: any) { toast.error(e.message || "Failed"); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-header">Teachers</h1>
          <p className="text-sm text-muted-foreground">{teachers.length} teacher{teachers.length === 1 ? "" : "s"} on staff</p>
        </div>
        <Button asChild className="font-semibold">
          <Link to="/admin/invitations"><UserPlus className="h-4 w-4 mr-2" />Invite Teacher</Link>
        </Button>
      </div>

      {teachers.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-2">No Teachers Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Invite a teacher to give them access to their classes.</p>
            <Button asChild><Link to="/admin/invitations">Invite Teacher</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teachers.map(t => (
            <Card key={t.userId} className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-primary shrink-0">
                      {(t.fullName || "T").split(" ").map(w => w[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{t.fullName || "Unnamed teacher"}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.phone || "No phone on file"}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setAssignFor(t)}><Plus className="h-3 w-3 mr-1" />Assign</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {t.assignments.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No classes assigned</span>
                  ) : t.assignments.map(a => (
                    <Badge key={a.id} variant="secondary" className="text-xs gap-1 pr-1">
                      {a.className}{a.subject ? ` • ${a.subject}` : ""}
                      <button onClick={() => handleUnassign(a.id)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!assignFor} onOpenChange={() => setAssignFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Class</DialogTitle>
            <DialogDescription>Give {assignFor?.fullName} access to a class.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Class *</Label>
              <Select value={assignForm.classId} onValueChange={v => setAssignForm(p => ({ ...p, classId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Subject (optional)</Label><Input value={assignForm.subject} onChange={e => setAssignForm(p => ({ ...p, subject: e.target.value }))} className="mt-1" placeholder="e.g. Mathematics" /></div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAssignFor(null)} disabled={saving}>Cancel</Button>
            <Button onClick={handleAssign} disabled={saving}>{saving ? "Saving..." : "Assign"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
