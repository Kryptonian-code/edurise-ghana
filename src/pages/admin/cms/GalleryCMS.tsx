import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Plus, Trash2, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const defaultGallery = [
  { id: "1", caption: "Students during morning assembly", album: "School Life" },
  { id: "2", caption: "Science laboratory practical session", album: "Academics" },
  { id: "3", caption: "Inter-house sports competition", album: "Sports" },
  { id: "4", caption: "Annual Speech and Prize Giving Day", album: "Events" },
  { id: "5", caption: "ICT laboratory in use", album: "Facilities" },
  { id: "6", caption: "Students in the library", album: "Academics" },
];

export default function GalleryCMS() {
  const [items, setItems] = useState(defaultGallery);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("Gallery updated!"); }, 600);
  };

  const update = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), caption: "", album: "General" }]);
  };

  const remove = (index: number) => setItems(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/cms"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="dashboard-header">Gallery</h1>
          <p className="text-sm text-muted-foreground">Upload and organise school photos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addItem}><Plus className="h-4 w-4 mr-2" />Add Photo</Button>
          <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save"}</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <Card key={item.id} className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
              <div><Label>Caption</Label><Input value={item.caption} onChange={e => update(i, "caption", e.target.value)} className="mt-1" /></div>
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-2"><Label>Album</Label><Input value={item.album} onChange={e => update(i, "album", e.target.value)} className="mt-1" /></div>
                <Button variant="ghost" size="icon" className="text-destructive mt-5" onClick={() => remove(i)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
