import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { schoolInfo } from "@/lib/demo-data";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-header">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage system settings and configurations</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <h3 className="font-bold text-foreground mb-4">School Information</h3>
            <div className="space-y-4">
              <div><Label>School Name</Label><Input defaultValue={schoolInfo.name} className="mt-1" /></div>
              <div><Label>Motto</Label><Input defaultValue={schoolInfo.motto} className="mt-1" /></div>
              <div><Label>Address</Label><Input defaultValue={schoolInfo.address} className="mt-1" /></div>
              <div><Label>Phone</Label><Input defaultValue={schoolInfo.phone} className="mt-1" /></div>
              <div><Label>Email</Label><Input defaultValue={schoolInfo.email} className="mt-1" /></div>
              <div><Label>WhatsApp</Label><Input defaultValue={schoolInfo.whatsapp} className="mt-1" /></div>
              <Button className="font-semibold">Save Changes</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <h3 className="font-bold text-foreground mb-4">SMS Configuration</h3>
            <p className="text-sm text-muted-foreground mb-4">Configure your SMS provider for sending notifications to parents and staff.</p>
            <div className="space-y-4">
              <div><Label>SMS Provider</Label><Input placeholder="e.g. Hubtel, Arkesel, mNotify" className="mt-1" /></div>
              <div><Label>API Key</Label><Input type="password" placeholder="Enter your SMS API key" className="mt-1" /></div>
              <div><Label>Sender ID</Label><Input placeholder="e.g. PRESTIGE" className="mt-1" /></div>
              <Button variant="outline" className="font-semibold">Save SMS Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
