import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCMS } from "@/lib/cms-store";

export default function AboutCMS() {
  const { getSection, updateSection } = useCMS();
  const about = getSection("about");
  const [form, setForm] = useState({ ...about });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ ...about });
  }, [about]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSection("about", form);
      toast.success("About page updated successfully!");
    } catch {
      toast.error("Unable to save about page content.");
    } finally {
      setSaving(false);
    }
  };

  const updateValue = (index: number, field: string, value: string) => {
    const updated = [...form.values];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, values: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/cms"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="dashboard-header">About Page</h1>
          <p className="text-sm text-muted-foreground">Update school mission, vision, and history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setForm({ ...about }); toast.info("Changes discarded."); }}><X className="h-4 w-4 mr-2" />Discard</Button>
          <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save Changes"}</Button>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-foreground text-lg">School History</h3>
          <div><Label>Paragraph 1</Label><Textarea value={form.history} onChange={e => setForm({ ...form, history: e.target.value })} className="mt-1" rows={4} /></div>
          <div><Label>Paragraph 2</Label><Textarea value={form.historyPara2} onChange={e => setForm({ ...form, historyPara2: e.target.value })} className="mt-1" rows={3} /></div>
          <div><Label>Paragraph 3</Label><Textarea value={form.historyPara3} onChange={e => setForm({ ...form, historyPara3: e.target.value })} className="mt-1" rows={3} /></div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-foreground text-lg">Mission Statement</h3>
            <Textarea value={form.mission} onChange={e => setForm({ ...form, mission: e.target.value })} rows={5} />
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-foreground text-lg">Vision Statement</h3>
            <Textarea value={form.vision} onChange={e => setForm({ ...form, vision: e.target.value })} rows={5} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-foreground text-lg">Core Values</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {form.values?.map((v: any, i: number) => (
              <div key={i} className="border border-border rounded-lg p-4 space-y-2">
                <div><Label>Title</Label><Input value={v.title} onChange={e => updateValue(i, "title", e.target.value)} className="mt-1" /></div>
                <div><Label>Description</Label><Textarea value={v.desc} onChange={e => updateValue(i, "desc", e.target.value)} className="mt-1" rows={2} /></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
