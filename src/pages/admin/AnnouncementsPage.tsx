import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Bell } from "lucide-react";
import { announcements as demoAnnouncements } from "@/lib/demo-data";
import { toast } from "sonner";

export default function AnnouncementsPage() {
  const [items, setItems] = useState(demoAnnouncements);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", audience: "All" });

  const handleCreate = () => {
    if (!form.title || !form.content) {
      toast.error("Please fill in title and content.");
      return;
    }
    setItems(prev => [{ id: Date.now().toString(), title: form.title, content: form.content, audience: form.audience, date: new Date().toISOString().split("T")[0] }, ...prev]);
    toast.success("Announcement published!");
    setDialogOpen(false);
    setForm({ title: "", content: "", audience: "All" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="dashboard-header">Announcements</h1>
          <p className="text-sm text-muted-foreground">Send announcements to parents, teachers, and staff</p>
        </div>
        <Button className="font-semibold" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />New Announcement</Button>
      </div>

      {items.length === 0 ? (
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
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">{a.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{a.content}</p>
                      <div className="flex gap-2 items-center">
                        <Badge variant="secondary" className="text-xs">{a.audience}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1" placeholder="e.g. End of Term Examination Schedule" /></div>
            <div>
              <Label>Audience</Label>
              <Select value={form.audience} onValueChange={v => setForm(p => ({ ...p, audience: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["All", "Parents", "Teachers", "Students"].map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Message *</Label><Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="mt-1" rows={4} placeholder="Write your announcement here..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
