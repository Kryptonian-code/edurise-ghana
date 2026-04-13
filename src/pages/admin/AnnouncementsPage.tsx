import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Bell } from "lucide-react";
import { announcements } from "@/lib/demo-data";

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="dashboard-header">Announcements</h1>
          <p className="text-sm text-muted-foreground">Send announcements to parents, teachers, and staff</p>
        </div>
        <Button className="font-semibold"><Plus className="h-4 w-4 mr-2" />New Announcement</Button>
      </div>

      <div className="space-y-4">
        {announcements.map(a => (
          <Card key={a.id} className="border-border hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{a.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{a.content}</p>
                    <div className="flex gap-2 items-center">
                      <Badge variant="secondary" className="text-xs">{a.audience}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
