import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Loader2, Link as LinkIcon, X, Users } from "lucide-react";
import { toast } from "sonner";
import { listParentLinks, listParents, linkParentToStudent, ParentLink, ParentProfile, unlinkParentStudent } from "@/lib/parents-store";
import { listStudents, StudentRow } from "@/lib/students-store";

const RELATIONSHIPS = ["Father", "Mother", "Guardian", "Grandparent", "Other"];

export default function ParentLinksPage() {
  const [parents, setParents] = useState<ParentProfile[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [links, setLinks] = useState<ParentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ parentId: "", studentId: "", relationship: "Guardian" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, s, l] = await Promise.all([listParents(), listStudents(), listParentLinks()]);
      setParents(p); setStudents(s); setLinks(l);
    } catch (e: any) { toast.error(e.message || "Failed to load"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleLink = async () => {
    if (!form.parentId || !form.studentId) { toast.error("Pick both a parent and a student"); return; }
    setSaving(true);
    try {
      await linkParentToStudent(form.parentId, form.studentId, form.relationship);
      toast.success("Link created");
      setOpen(false);
      setForm({ parentId: "", studentId: "", relationship: "Guardian" });
      await load();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleUnlink = async (id: string) => {
    try { await unlinkParentStudent(id); toast.success("Unlinked"); await load(); }
    catch (e: any) { toast.error(e.message || "Failed"); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-header">Parent ↔ Student Links</h1>
          <p className="text-sm text-muted-foreground">Connect parent accounts to their children so they can see their data.</p>
        </div>
        <Button className="font-semibold" onClick={() => setOpen(true)} disabled={parents.length === 0 || students.length === 0}>
          <Plus className="h-4 w-4 mr-2" />New Link
        </Button>
      </div>

      {parents.length === 0 && (
        <Card className="border-border"><CardContent className="p-6 text-sm text-muted-foreground">
          No parent accounts yet. Parents are created automatically when someone signs up.
        </CardContent></Card>
      )}

      {links.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-2">No Links Yet</h3>
            <p className="text-sm text-muted-foreground">Create a link to grant a parent access to a child's records.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {links.map(l => (
            <Card key={l.id} className="border-border">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />{l.parentName || "Unnamed parent"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">→ {l.studentName} {l.className ? `• ${l.className}` : ""}</p>
                  <Badge variant="secondary" className="text-xs mt-1">{l.relationship}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleUnlink(l.id)} className="text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Parent Link</DialogTitle>
            <DialogDescription>Pick a parent and the child they should access.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Parent *</Label>
              <Select value={form.parentId} onValueChange={v => setForm(p => ({ ...p, parentId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select parent" /></SelectTrigger>
                <SelectContent>
                  {parents.map(p => (<SelectItem key={p.userId} value={p.userId}>{p.fullName || p.userId.slice(0, 8)}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Student *</Label>
              <Select value={form.studentId} onValueChange={v => setForm(p => ({ ...p, studentId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map(s => (<SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName} {s.className ? `• ${s.className}` : ""}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Relationship</Label>
              <Select value={form.relationship} onValueChange={v => setForm(p => ({ ...p, relationship: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{RELATIONSHIPS.map(r => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleLink} disabled={saving}>{saving ? "Saving..." : "Create Link"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
