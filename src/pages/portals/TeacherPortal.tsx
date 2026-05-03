import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Users, BookOpen, ClipboardList, Bell, LogOut, GraduationCap, Calendar } from "lucide-react";
import { announcements } from "@/lib/demo-data";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function TeacherPortal() {
  const myClasses = ["JHS 1", "JHS 2", "JHS 3"];
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => { await signOut(); toast.success("Signed out"); navigate("/login", { replace: true }); };
  const label = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Teacher";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-3">
        <div className="container-wide mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-accent" />
            <span className="font-bold text-sm sm:text-base">Teacher Portal</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm hidden sm:block">{label}</span>
            <Button variant="ghost" size="sm" className="text-primary-foreground" onClick={handleSignOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container-wide mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="dashboard-header">Welcome, {label}</h1>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: Users, label: "My Students", value: "105", sub: "Across 3 classes" },
            { icon: BookOpen, label: "Subject", value: "Maths", sub: "Mathematics" },
            { icon: ClipboardList, label: "Pending Scores", value: "2", sub: "Classes to grade" },
            { icon: Calendar, label: "Next Class", value: "JHS 2", sub: "9:00 AM Today" },
          ].map(s => (
            <Card key={s.label} className="stat-card">
              <CardContent className="p-3 sm:p-4">
                <s.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary mb-2" />
                <p className="text-lg sm:text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs sm:text-sm font-medium text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold text-foreground mb-4">My Classes</h3>
              <div className="space-y-3">
                {myClasses.map(c => (
                  <div key={c} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{c}</p>
                      <p className="text-xs text-muted-foreground">Mathematics</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs">Attendance</Button>
                      <Button variant="outline" size="sm" className="text-xs">Scores</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Announcements</h3>
              {announcements.filter(a => a.audience === "All" || a.audience === "Teachers").length === 0 ? (
                <p className="text-sm text-muted-foreground">No announcements at this time.</p>
              ) : (
                <div className="space-y-3">
                  {announcements.filter(a => a.audience === "All" || a.audience === "Teachers").slice(0, 3).map(a => (
                    <div key={a.id} className="py-3 border-b border-border last:border-0">
                      <p className="font-medium text-foreground text-sm">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-4">
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </main>
    </div>
  );
}
