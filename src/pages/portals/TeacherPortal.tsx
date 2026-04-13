import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Users, BookOpen, ClipboardList, Bell, LogOut, GraduationCap, Calendar } from "lucide-react";
import { announcements, students } from "@/lib/demo-data";

export default function TeacherPortal() {
  const myClasses = ["JHS 1", "JHS 2", "JHS 3"];
  const myStudents = students.filter(s => myClasses.some(c => s.class.startsWith(c.split(" ")[0])));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-3">
        <div className="container-wide mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-accent" />
            <span className="font-bold">Teacher Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:block">Mr. Emmanuel Tetteh</span>
            <Link to="/login"><Button variant="ghost" size="sm" className="text-primary-foreground"><LogOut className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </header>

      <main className="container-wide mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="dashboard-header">Good Morning, Mr. Tetteh</h1>
          <p className="text-sm text-muted-foreground">Mathematics Teacher • {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "My Students", value: "105", sub: "Across 3 classes" },
            { icon: BookOpen, label: "Subject", value: "Maths", sub: "Mathematics" },
            { icon: ClipboardList, label: "Pending Scores", value: "2", sub: "Classes to grade" },
            { icon: Calendar, label: "Next Class", value: "JHS 2", sub: "9:00 AM Today" },
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

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-4">My Classes</h3>
              <div className="space-y-3">
                {myClasses.map(c => (
                  <div key={c} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{c}</p>
                      <p className="text-xs text-muted-foreground">Mathematics</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Attendance</Button>
                      <Button variant="outline" size="sm">Scores</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Announcements</h3>
              <div className="space-y-3">
                {announcements.filter(a => a.audience === "All" || a.audience === "Teachers").slice(0, 3).map(a => (
                  <div key={a.id} className="py-3 border-b border-border last:border-0">
                    <p className="font-medium text-foreground text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-4">
          <Link to="/login"><Button variant="outline">Sign Out</Button></Link>
        </div>
      </main>
    </div>
  );
}
