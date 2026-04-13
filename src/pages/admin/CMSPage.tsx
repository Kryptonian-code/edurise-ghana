import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Image, FileText, Settings, Palette } from "lucide-react";

const cmsModules = [
  { icon: Globe, title: "Homepage Content", desc: "Edit hero section, about summary, and call to action", path: "#" },
  { icon: FileText, title: "About Page", desc: "Update school mission, vision, and history", path: "#" },
  { icon: FileText, title: "Programmes", desc: "Manage educational programmes and descriptions", path: "#" },
  { icon: FileText, title: "Staff Profiles", desc: "Add and edit teacher and staff profiles", path: "#" },
  { icon: Image, title: "Gallery", desc: "Upload and organise school photos", path: "#" },
  { icon: FileText, title: "News & Blog", desc: "Publish news articles and updates", path: "#" },
  { icon: FileText, title: "Events", desc: "Manage upcoming school events", path: "#" },
  { icon: FileText, title: "FAQ", desc: "Edit frequently asked questions", path: "#" },
  { icon: Settings, title: "Contact Information", desc: "Update school address, phone, and email", path: "#" },
  { icon: Palette, title: "Site Settings", desc: "Logo, colours, social media links, and footer", path: "#" },
];

export default function CMSPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-header">Content Management</h1>
        <p className="text-sm text-muted-foreground">Edit your public website content without touching any code</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cmsModules.map(m => (
          <Card key={m.title} className="border-border hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center mb-3">
                <m.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{m.title}</h3>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
