import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCMS } from "@/lib/cms-store";

export default function HomepageCMS() {
  const { getSection, updateSection } = useCMS();
  const homepage = getSection("homepage");

  const [form, setForm] = useState({ ...homepage });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ ...homepage });
  }, [homepage]);

  const handleSave = async () => {
    setSaving(true);
    try {
      updateSection("homepage", form);
      toast.success("Homepage content updated successfully!");
    } catch {
      toast.error("Unable to save homepage content.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ ...homepage });
    toast.info("Changes discarded.");
  };

  const updatePoint = (index: number, value: string) => {
    const updated = [...form.whyChoosePoints];
    updated[index] = value;
    setForm({ ...form, whyChoosePoints: updated });
  };

  const addPoint = () => {
    setForm({ ...form, whyChoosePoints: [...form.whyChoosePoints, ""] });
  };

  const removePoint = (index: number) => {
    setForm({ ...form, whyChoosePoints: form.whyChoosePoints.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/cms">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="dashboard-header">Homepage Content</h1>
          <p className="text-sm text-muted-foreground">Edit hero section, about summary, and call to action</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}><X className="h-4 w-4 mr-2" />Discard</Button>
          <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save Changes"}</Button>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-6 space-y-6">
          <h3 className="font-bold text-foreground text-lg">Hero Section</h3>
          <div className="space-y-4">
            <div>
              <Label>Hero Heading</Label>
              <Input value={form.heroHeading} onChange={e => setForm({ ...form, heroHeading: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Hero Subtitle</Label>
              <Textarea value={form.heroSubtitle} onChange={e => setForm({ ...form, heroSubtitle: e.target.value })} className="mt-1" rows={3} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Primary Button Text</Label>
                <Input value={form.heroCTA1} onChange={e => setForm({ ...form, heroCTA1: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Secondary Button Text</Label>
                <Input value={form.heroCTA2} onChange={e => setForm({ ...form, heroCTA2: e.target.value })} className="mt-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-6 space-y-6">
          <h3 className="font-bold text-foreground text-lg">Why Choose Us Section</h3>
          <div className="space-y-4">
            <div>
              <Label>Section Title</Label>
              <Input value={form.whyChooseTitle} onChange={e => setForm({ ...form, whyChooseTitle: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.whyChooseText} onChange={e => setForm({ ...form, whyChooseText: e.target.value })} className="mt-1" rows={4} />
            </div>
            <div>
              <Label className="mb-2 block">Key Points</Label>
              <div className="space-y-2">
                {form.whyChoosePoints?.map((point: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input value={point} onChange={e => updatePoint(i, e.target.value)} />
                    <Button variant="ghost" size="icon" onClick={() => removePoint(i)} className="shrink-0 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addPoint} className="mt-2"><Plus className="h-3 w-3 mr-1" />Add Point</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-6 space-y-6">
          <h3 className="font-bold text-foreground text-lg">Call to Action Section</h3>
          <div className="space-y-4">
            <div>
              <Label>Heading</Label>
              <Input value={form.ctaHeading} onChange={e => setForm({ ...form, ctaHeading: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.ctaText} onChange={e => setForm({ ...form, ctaText: e.target.value })} className="mt-1" rows={2} />
            </div>
            <div>
              <Label>Button Text</Label>
              <Input value={form.ctaButton} onChange={e => setForm({ ...form, ctaButton: e.target.value })} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
