import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { events as defaultEvents } from "@/lib/demo-data";

export default function EventsCMS() {
  const [items, setItems] = useState(defaultEvents.map(e => ({ ...e })));
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setEditing(null); toast.success("Events updated!"); }, 600);
  };

  const update = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addEvent = () => {
    const newEvent = { id: Date.now().toString(), title: "", date: "", time: "", venue: "", description: "" };
    setItems([newEvent, ...items]);
    setEditing(newEvent.id);
  };

  const remove = (index: number) => setItems(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/cms"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="dashboard-header">Events</h1>
          <p className="text-sm text-muted-foreground">Manage upcoming school events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addEvent}><Plus className="h-4 w-4 mr-2" />Add Event</Button>
          <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save All"}</Button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((event, i) => (
          <Card key={event.id} className="border-border">
            <CardContent className="p-6">
              {editing === event.id ? (
                <div className="space-y-4">
                  <div><Label>Event Title</Label><Input value={event.title} onChange={e => update(i, "title", e.target.value)} className="mt-1" /></div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div><Label>Date</Label><Input type="date" value={event.date} onChange={e => update(i, "date", e.target.value)} className="mt-1" /></div>
                    <div><Label>Time</Label><Input value={event.time} onChange={e => update(i, "time", e.target.value)} className="mt-1" placeholder="e.g. 10:00 AM" /></div>
                    <div><Label>Venue</Label><Input value={event.venue} onChange={e => update(i, "venue", e.target.value)} className="mt-1" /></div>
                  </div>
                  <div><Label>Description</Label><Textarea value={event.description} onChange={e => update(i, "description", e.target.value)} className="mt-1" rows={3} /></div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setEditing(null)}>Done</Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(i)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{event.title || "Untitled Event"}</h3>
                    <p className="text-xs text-muted-foreground">{event.date ? new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "No date set"} • {event.time} • {event.venue}</p>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setEditing(event.id)}><Edit className="h-4 w-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
