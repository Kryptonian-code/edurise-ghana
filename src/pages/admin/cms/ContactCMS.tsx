import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { schoolInfo } from "@/lib/demo-data";
import { useCMS } from "@/lib/cms-store";

export default function ContactCMS() {
  const { getSection, updateSection } = useCMS();
  const contact = getSection("contact");
  const [form, setForm] = useState({
    name: schoolInfo.name,
    address: schoolInfo.address,
    phone: schoolInfo.phone,
    email: schoolInfo.email,
    whatsapp: schoolInfo.whatsapp,
    poBox: schoolInfo.poBox,
    digitalAddress: schoolInfo.digitalAddress,
    officeHours: "Mon - Fri: 7:30 AM - 4:00 PM",
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(prev => ({ ...prev, ...contact }));
  }, [contact]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSection("contact", form);
      toast.success("Contact information updated!");
    } catch {
      toast.error("Unable to save contact information.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/cms"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="dashboard-header">Contact Information</h1>
          <p className="text-sm text-muted-foreground">Update school address, phone, and email</p>
        </div>
        <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save Changes"}</Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-foreground">Contact Details</h3>
            <div><Label>School Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="mt-1" /></div>
            <div><Label>P.O. Box</Label><Input value={form.poBox} onChange={e => setForm({ ...form, poBox: e.target.value })} className="mt-1" /></div>
            <div><Label>Digital Address</Label><Input value={form.digitalAddress} onChange={e => setForm({ ...form, digitalAddress: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
              <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className="mt-1" /></div>
            </div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
            <div><Label>Office Hours</Label><Input value={form.officeHours} onChange={e => setForm({ ...form, officeHours: e.target.value })} className="mt-1" /></div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-foreground">Social Media Links</h3>
            <div><Label>Facebook URL</Label><Input value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} className="mt-1" placeholder="https://facebook.com/..." /></div>
            <div><Label>Instagram URL</Label><Input value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} className="mt-1" placeholder="https://instagram.com/..." /></div>
            <div><Label>Twitter / X URL</Label><Input value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} className="mt-1" placeholder="https://x.com/..." /></div>
            <div><Label>YouTube URL</Label><Input value={form.youtube} onChange={e => setForm({ ...form, youtube: e.target.value })} className="mt-1" placeholder="https://youtube.com/..." /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
