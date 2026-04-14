import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { schoolInfo } from "@/lib/demo-data";
import { toast } from "sonner";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-header">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage system settings and configurations</p>
      </div>

      <Tabs defaultValue="school" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="school">School Info</TabsTrigger>
          <TabsTrigger value="academic">Academic Year</TabsTrigger>
          <TabsTrigger value="sms">SMS & Notifications</TabsTrigger>
          <TabsTrigger value="roles">Roles & Access</TabsTrigger>
        </TabsList>

        <TabsContent value="school">
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-4">School Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>School Name</Label><Input defaultValue={schoolInfo.name} className="mt-1" /></div>
                <div><Label>Motto</Label><Input defaultValue={schoolInfo.motto} className="mt-1" /></div>
                <div><Label>Address</Label><Input defaultValue={schoolInfo.address} className="mt-1" /></div>
                <div><Label>P.O. Box</Label><Input defaultValue={schoolInfo.poBox} className="mt-1" /></div>
                <div><Label>Phone</Label><Input defaultValue={schoolInfo.phone} className="mt-1" /></div>
                <div><Label>Email</Label><Input defaultValue={schoolInfo.email} className="mt-1" /></div>
                <div><Label>WhatsApp</Label><Input defaultValue={schoolInfo.whatsapp} className="mt-1" /></div>
                <div><Label>Digital Address</Label><Input defaultValue={schoolInfo.digitalAddress} className="mt-1" /></div>
              </div>
              <Button className="font-semibold mt-4" onClick={() => toast.success("Settings saved!")}>Save Changes</Button>
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
