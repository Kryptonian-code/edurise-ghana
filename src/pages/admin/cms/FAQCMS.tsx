import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { faqItems as defaultFAQ } from "@/lib/demo-data";

export default function FAQCMS() {
  const [items, setItems] = useState(defaultFAQ.map(f => ({ ...f })));
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("FAQ updated!"); }, 600);
  };

  const update = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItem = () => setItems([...items, { question: "", answer: "" }]);
  const remove = (index: number) => setItems(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/cms"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="dashboard-header">FAQ</h1>
          <p className="text-sm text-muted-foreground">Edit frequently asked questions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addItem}><Plus className="h-4 w-4 mr-2" />Add Question</Button>
          <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save"}</Button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground">Question {i + 1}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(i)}><Trash2 className="h-3 w-3" /></Button>
              </div>
              <div className="space-y-3">
                <div><Label>Question</Label><Input value={item.question} onChange={e => update(i, "question", e.target.value)} className="mt-1" /></div>
                <div><Label>Answer</Label><Textarea value={item.answer} onChange={e => update(i, "answer", e.target.value)} className="mt-1" rows={3} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
