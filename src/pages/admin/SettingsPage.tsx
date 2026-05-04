import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { fetchBranding, saveBranding, clearLogo, uploadLogo, type SchoolBranding } from "@/lib/branding-store";
import { Upload, Trash2, GraduationCap, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [branding, setBranding] = useState<SchoolBranding | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchBranding().then(setBranding).catch(() => setBranding(null)); }, []);

  const handleField = <K extends keyof SchoolBranding>(key: K, value: SchoolBranding[K]) => {
    setBranding(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const handleSaveSchool = async () => {
    if (!branding) return;
    setSaving(true);
    try {
      const next = await saveBranding(branding);
      setBranding(next);
      toast.success("School information saved.");
    } catch (e: any) {
      toast.error(e.message || "Couldn't save settings.");
    } finally { setSaving(false); }
  };

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be under 2 MB."); return; }
    setUploading(true);
    try {
      const url = await uploadLogo(file);
      const next = await saveBranding({ ...(branding || {} as any), logoUrl: url });
      setBranding(next);
      toast.success("School logo uploaded. It will appear on all report cards.");
    } catch (e: any) {
      toast.error(e.message || "Logo upload failed.");
    } finally { setUploading(false); }
  };

  const handleRemoveLogo = async () => {
    try {
      await clearLogo();
      const next = await fetchBranding();
      setBranding(next);
      toast.success("School logo removed.");
    } catch (e: any) { toast.error(e.message || "Couldn't remove logo."); }
  };

  if (!branding) return <div className="p-8 text-sm text-muted-foreground">Loading settings…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-header">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage system settings and configurations</p>
      </div>

      <Tabs defaultValue="school" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="school">School Info</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="academic">Academic Year</TabsTrigger>
        </TabsList>

        <TabsContent value="school">
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-4">School Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>School Name</Label><Input value={branding.name} onChange={e => handleField("name", e.target.value)} className="mt-1" /></div>
                <div><Label>Motto</Label><Input value={branding.motto} onChange={e => handleField("motto", e.target.value)} className="mt-1" /></div>
                <div className="sm:col-span-2"><Label>Address</Label><Input value={branding.address} onChange={e => handleField("address", e.target.value)} className="mt-1" /></div>
                <div><Label>Phone</Label><Input value={branding.phone} onChange={e => handleField("phone", e.target.value)} className="mt-1" /></div>
                <div><Label>Email</Label><Input value={branding.email} onChange={e => handleField("email", e.target.value)} className="mt-1" /></div>
                <div><Label>Website</Label><Input value={branding.website} onChange={e => handleField("website", e.target.value)} className="mt-1" /></div>
              </div>
              <Button className="font-semibold mt-4" onClick={handleSaveSchool} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-1">School Logo</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload a square logo (PNG or JPG, max 2 MB). It is automatically applied to report cards, the parent portal, and printed documents.</p>

              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="h-28 w-28 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/40 overflow-hidden shrink-0">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="School logo" className="h-full w-full object-contain" />
                  ) : (
                    <GraduationCap className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.target.value = ""; }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                      {branding.logoUrl ? "Replace logo" : "Upload logo"}
                    </Button>
                    {branding.logoUrl && (
                      <Button variant="outline" onClick={handleRemoveLogo}>
                        <Trash2 className="h-4 w-4 mr-2" />Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Recommended: 512×512 PNG with a transparent background.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-4">Academic Year Configuration</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Academic Year</Label><Input defaultValue="2024/2025" className="mt-1" /></div>
                <div>
                  <Label>Current Term</Label>
                  <Select defaultValue="term1">
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="term1">Term 1</SelectItem>
                      <SelectItem value="term2">Term 2</SelectItem>
                      <SelectItem value="term3">Term 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="font-semibold mt-4" onClick={() => toast.success("Academic year saved.")}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
