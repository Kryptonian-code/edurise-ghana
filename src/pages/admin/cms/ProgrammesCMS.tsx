import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { programmes as defaultProgrammes } from "@/lib/demo-data";

export default function ProgrammesCMS() {
  const [items, setItems] = useState(defaultProgrammes.map(p => ({ ...p })));
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Programmes updated successfully!");
    }, 600);
  };

  const update = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addProgramme = () => {
    setItems([...items, { id: Date.now().toString(), name: "", description: "", ageRange: "" }]);
  };

  const remove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/cms"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="dashboard-header">Programmes</h1>
          <p className="text-sm text-muted-foreground">Manage educational programmes and descriptions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addProgramme}><Plus className="h-4 w-4 mr-2" />Add Programme</Button>
          <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save Changes"}</Button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((prog, i) => (
          <Card key={prog.id} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <span className="text-sm font-bold text-muted-foreground">Programme {i + 1}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(i)} className="text-destructive h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Programme Name</Label><Input value={prog.name} onChange={e => update(i, "name", e.target.value)} className="mt-1" /></div>
                <div><Label>Age Range</Label><Input value={prog.ageRange} onChange={e => update(i, "ageRange", e.target.value)} className="mt-1" /></div>
              </div>
              <div className="mt-4">
                <Label>Description</Label>
                <Textarea value={prog.description} onChange={e => update(i, "description", e.target.value)} className="mt-1" rows={3} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
