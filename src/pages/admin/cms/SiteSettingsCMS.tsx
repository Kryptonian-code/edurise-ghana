import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function SiteSettingsCMS() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    schoolName: "Prestige Academy International",
    motto: "Excellence Through Knowledge",
    footerText: "© 2025 Prestige Academy International. All rights reserved.",
    footerTagline: "Providing quality education in Ghana since 2005.",
    primaryColor: "#0b3a30",
    accentColor: "#d7c7a3",
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("Site settings updated!"); }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/cms"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="dashboard-header">Site Settings</h1>
          <p className="text-sm text-muted-foreground">Logo, colours, social media links, and footer</p>
        </div>
        <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save Changes"}</Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-foreground">Branding</h3>
            <div><Label>School Name</Label><Input value={form.schoolName} onChange={e => setForm({ ...form, schoolName: e.target.value })} className="mt-1" /></div>
            <div><Label>Motto</Label><Input value={form.motto} onChange={e => setForm({ ...form, motto: e.target.value })} className="mt-1" /></div>
            <div>
              <Label>School Logo</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload school logo</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-foreground">Colours</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Primary Colour</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} className="h-10 w-10 rounded border-0 cursor-pointer" />
                  <Input value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div>
                <Label>Accent Colour</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={form.accentColor} onChange={e => setForm({ ...form, accentColor: e.target.value })} className="h-10 w-10 rounded border-0 cursor-pointer" />
                  <Input value={form.accentColor} onChange={e => setForm({ ...form, accentColor: e.target.value })} className="flex-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-foreground">Footer</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Copyright Text</Label><Input value={form.footerText} onChange={e => setForm({ ...form, footerText: e.target.value })} className="mt-1" /></div>
              <div><Label>Footer Tagline</Label><Input value={form.footerTagline} onChange={e => setForm({ ...form, footerTagline: e.target.value })} className="mt-1" /></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
