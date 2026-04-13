import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { User, BookOpen, DollarSign, Bell, FileText, ClipboardList, LogOut, GraduationCap } from "lucide-react";
import { students, announcements, feeRecords } from "@/lib/demo-data";

const child = students[0];
const childFees = feeRecords.filter(f => f.studentId === child.id);

export default function ParentPortal() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-3">
        <div className="container-wide mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-accent" />
            <span className="font-bold">Parent Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:block">Mr. Kofi Asante</span>
            <Link to="/login"><Button variant="ghost" size="sm" className="text-primary-foreground"><LogOut className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </header>

      <main className="container-wide mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="dashboard-header">Welcome, Mr. Asante</h1>
          <p className="text-sm text-muted-foreground">Here's an overview of your child's academic progress.</p>
        </div>

        {/* Child card */}
        <Card className="border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center text-xl font-bold text-primary">KA</div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{child.firstName} {child.lastName}</h2>
              <p className="text-sm text-muted-foreground">{child.class} • Student ID: {child.studentId}</p>
              <Badge variant="default" className="text-xs mt-1">{child.status}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: ClipboardList, label: "Attendance", value: "96%", sub: "This term" },
            { icon: BookOpen, label: "Class Position", value: "3rd", sub: "Out of 35" },
            { icon: DollarSign, label: "Fee Balance", value: child.feeBalance > 0 ? `₵${child.feeBalance.toLocaleString()}` : "Cleared", sub: "Term 1" },
            { icon: FileText, label: "Report Cards", value: "Available", sub: "Term 1 ready" },
          ].map(s => (
            <Card key={s.label} className="stat-card">
              <CardContent className="p-4">
                <s.icon className="h-5 w-5 text-primary mb-2" />
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm font-medium text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border">
          <CardContent className="p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Recent Announcements</h3>
            <div className="space-y-3">
              {announcements.filter(a => a.audience === "All" || a.audience === "Parents").slice(0, 3).map(a => (
                <div key={a.id} className="py-3 border-b border-border last:border-0">
                  <p className="font-medium text-foreground text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{a.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-4">
          <Link to="/login">
            <Button variant="outline">Sign Out</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
