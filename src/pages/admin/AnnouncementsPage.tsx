import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Bell, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AnnouncementRow, createAnnouncement, deleteAnnouncement, listAnnouncements } from "@/lib/announcements-store";
import { logAudit } from "@/lib/audit";

const AUDIENCES = ["all", "parents", "teachers", "students"] as const;

export default function AnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", audience: "all" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems(await listAnnouncements()); }
    catch (e: any) { toast.error(e.message || "Failed to load announcements"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.body) { toast.error("Please fill in title and message."); return; }
    setSaving(true);
    try {
      const row = await createAnnouncement(form);
      setItems(prev => [row, ...prev]);
      logAudit("announcement.create", "announcement", row.id, { audience: row.audience });
      toast.success("Announcement published.");
      setDialogOpen(false);
      setForm({ title: "", body: "", audience: "all" });
    } catch (e: any) { toast.error(e.message || "Failed to publish"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAnnouncement(deleteId);
      setItems(prev => prev.filter(a => a.id !== deleteId));
      logAudit("announcement.delete", "announcement", deleteId);
      toast.success("Announcement removed.");
    } catch (e: any) { toast.error(e.message || "Failed to delete"); }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-header">Announcements</h1>
          <p className="text-sm text-muted-foreground">Send announcements to parents, teachers, and staff</p>
        </div>
        <Button className="font-semibold" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />New Announcement</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-2">No Announcements Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first announcement to communicate with parents and staff.</p>
            <Button onClick={() => setDialogOpen(true)}>Create Announcement</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map(a => (
            <Card key={a.id} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground mb-1">{a.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">{a.body}</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge variant="secondary" className="text-xs capitalize">{a.audience}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => setDeleteId(a.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
            <DialogDescription>This announcement will be visible to the selected audience.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1" placeholder="e.g. End of Term Examination Schedule" /></div>
            <div>
              <Label>Audience</Label>
              <Select value={form.audience} onValueChange={v => setForm(p => ({ ...p, audience: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map(a => (<SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Message *</Label><Textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} className="mt-1" rows={4} placeholder="Write your announcement here..." /></div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Publishing..." : "Publish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this announcement? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
