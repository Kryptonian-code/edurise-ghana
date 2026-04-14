import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { teachers } from "@/lib/demo-data";

export default function StaffCMS() {
  const [staff, setStaff] = useState(teachers.map(t => ({ ...t })));
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("Staff profiles updated!"); }, 600);
  };

  const update = (index: number, field: string, value: string) => {
    const updated = [...staff];
    updated[index] = { ...updated[index], [field]: value };
    setStaff(updated);
  };

  const addStaff = () => {
    setStaff([...staff, { id: Date.now().toString(), name: "", subject: "", classes: [], phone: "", email: "", qualification: "" }]);
  };

  const remove = (index: number) => setStaff(staff.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/cms"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="dashboard-header">Staff Profiles</h1>
          <p className="text-sm text-muted-foreground">Add and edit teacher and staff profiles displayed on the website</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addStaff}><Plus className="h-4 w-4 mr-2" />Add Staff</Button>
          <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save"}</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {staff.map((s, i) => (
          <Card key={s.id} className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">Staff Member</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(i)}><Trash2 className="h-3 w-3" /></Button>
              </div>
              <div><Label>Full Name</Label><Input value={s.name} onChange={e => update(i, "name", e.target.value)} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Subject</Label><Input value={s.subject} onChange={e => update(i, "subject", e.target.value)} className="mt-1" /></div>
                <div><Label>Qualification</Label><Input value={s.qualification} onChange={e => update(i, "qualification", e.target.value)} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Phone</Label><Input value={s.phone} onChange={e => update(i, "phone", e.target.value)} className="mt-1" /></div>
                <div><Label>Email</Label><Input value={s.email} onChange={e => update(i, "email", e.target.value)} className="mt-1" /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
