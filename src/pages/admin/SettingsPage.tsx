import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getBranding, saveBranding, clearLogo, type SchoolBranding } from "@/lib/branding-store";
import { Upload, Trash2, GraduationCap } from "lucide-react";

export default function SettingsPage() {
  const [branding, setBranding] = useState<SchoolBranding>(() => getBranding());
  const fileRef = useRef<HTMLInputElement>(null);

  const handleField = <K extends keyof SchoolBranding>(key: K, value: SchoolBranding[K]) => {
    setBranding(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSchool = () => {
    saveBranding(branding);
    toast.success("School information saved.");
  };

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file."); return; }
    if (file.size > 1.5 * 1024 * 1024) { toast.error("Logo must be under 1.5 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const next = saveBranding({ logoDataUrl: dataUrl });
      setBranding(next);
      toast.success("School logo uploaded. It will appear on all report cards.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    clearLogo();
    setBranding(getBranding());
    toast.success("School logo removed.");
  };

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
          <TabsTrigger value="sms">SMS & Notifications</TabsTrigger>
          <TabsTrigger value="roles">Roles & Access</TabsTrigger>
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
              <Button className="font-semibold mt-4" onClick={handleSaveSchool}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-1">School Logo</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload a square logo (PNG or JPG, max 1.5 MB). It is automatically applied to report cards, the parent portal, and printed documents.</p>

              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="h-28 w-28 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/40 overflow-hidden shrink-0">
                  {branding.logoDataUrl ? (
                    <img src={branding.logoDataUrl} alt="School logo" className="h-full w-full object-contain" />
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
                    <Button onClick={() => fileRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />{branding.logoDataUrl ? "Replace logo" : "Upload logo"}
                    </Button>
                    {branding.logoDataUrl && (
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
                <div><Label>Term Start Date</Label><Input type="date" defaultValue="2024-09-09" className="mt-1" /></div>
                <div><Label>Term End Date</Label><Input type="date" defaultValue="2024-12-20" className="mt-1" /></div>
                <div><Label>Next Term Reopening</Label><Input type="date" defaultValue="2025-01-06" className="mt-1" /></div>
              </div>
              <Button className="font-semibold mt-4" onClick={() => toast.success("Academic year settings saved!")}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-4">SMS Configuration</h3>
              <p className="text-sm text-muted-foreground mb-4">Configure your SMS provider for sending notifications to parents and staff.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>SMS Provider</Label>
                  <Select defaultValue="">
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select provider" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hubtel">Hubtel</SelectItem>
                      <SelectItem value="arkesel">Arkesel</SelectItem>
                      <SelectItem value="mnotify">mNotify</SelectItem>
                      <SelectItem value="wittyflow">WittyFlow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Sender ID</Label><Input placeholder="e.g. PRESTIGE" className="mt-1" /></div>
                <div><Label>API Key</Label><Input type="password" placeholder="Enter your SMS API key" className="mt-1" /></div>
                <div><Label>API Secret (if required)</Label><Input type="password" placeholder="Enter API secret" className="mt-1" /></div>
              </div>
              <Button variant="outline" className="font-semibold mt-4" onClick={() => toast.success("SMS settings saved!")}>Save SMS Settings</Button>
            </CardContent>
          </Card>

          <Card className="border-border mt-4">
            <CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-4">Email (SMTP) Configuration</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>SMTP Host</Label><Input placeholder="e.g. smtp.gmail.com" className="mt-1" /></div>
                <div><Label>SMTP Port</Label><Input placeholder="587" className="mt-1" /></div>
                <div><Label>Email Address</Label><Input type="email" placeholder="noreply@school.edu.gh" className="mt-1" /></div>
                <div><Label>Password</Label><Input type="password" placeholder="App password" className="mt-1" /></div>
              </div>
              <Button variant="outline" className="font-semibold mt-4" onClick={() => toast.success("Email settings saved!")}>Save Email Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-4">User Roles</h3>
              <p className="text-sm text-muted-foreground mb-4">Manage role-based access control for the system.</p>
              <div className="space-y-3">
                {[
                  { role: "Super Admin", desc: "Full access to all modules and settings", count: 1 },
                  { role: "School Admin", desc: "Access to student, teacher, and academic management", count: 2 },
                  { role: "Teacher", desc: "Attendance, results entry, and class management", count: 62 },
                  { role: "Account Officer", desc: "Fees, billing, and financial reports", count: 3 },
                  { role: "Parent", desc: "View child's results, attendance, and fee balance", count: 420 },
                ].map(r => (
                  <div key={r.role} className="flex items-center justify-between py-3 px-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground text-sm">{r.role}</p>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">{r.count} users</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
