import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { BookOpen, DollarSign, Bell, FileText, ClipboardList, LogOut, GraduationCap, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { listMyChildren } from "@/lib/parents-store";
import { listFeesForStudent, FeeInvoice } from "@/lib/fees-store";
import { studentAttendanceSummary } from "@/lib/attendance-store";
import { listAnnouncements, AnnouncementRow } from "@/lib/announcements-store";

interface Child { id: string; firstName: string; lastName: string; className?: string; }
interface ChildSummary {
  child: Child;
  attendance: { rate: number; total: number };
  feeBalance: number;
  fees: FeeInvoice[];
}

export default function ParentPortal() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<ChildSummary[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);

  const handleSignOut = async () => { await signOut(); toast.success("Signed out"); navigate("/login", { replace: true }); };
  const label = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Parent";

  useEffect(() => {
    (async () => {
      try {
        const [children, ann] = await Promise.all([listMyChildren(), listAnnouncements()]);
        const built: ChildSummary[] = await Promise.all(children.map(async c => {
          const [att, fees] = await Promise.all([
            studentAttendanceSummary(c.id),
            listFeesForStudent(c.id),
          ]);
          const balance = fees.reduce((s, f) => s + (f.amount - f.amountPaid), 0);
          return { child: c, attendance: { rate: att.rate, total: att.total }, feeBalance: balance, fees };
        }));
        setSummaries(built);
        setAnnouncements(ann.filter(a => ["all", "parents"].includes(a.audience)));
      } catch (e: any) { toast.error(e.message || "Failed to load"); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-3">
        <div className="container-wide mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-accent" />
            <span className="font-bold text-sm sm:text-base">Parent Portal</span>
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
          <p className="text-sm text-muted-foreground">Here's an overview of your children's progress.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : summaries.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-bold text-foreground mb-2">No Children Linked Yet</h3>
              <p className="text-sm text-muted-foreground">Ask the school admin to link your child to your account so you can view their records.</p>
            </CardContent>
          </Card>
        ) : (
          summaries.map(({ child, attendance, feeBalance, fees }) => (
            <div key={child.id} className="space-y-4">
              <Card className="border-border">
                <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-accent/20 flex items-center justify-center text-lg sm:text-xl font-bold text-primary shrink-0">
                    {(child.firstName[0] || "") + (child.lastName[0] || "")}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-foreground truncate">{child.firstName} {child.lastName}</h2>
                    <p className="text-sm text-muted-foreground">{child.className || "Unassigned class"}</p>
                    <Badge variant="default" className="text-xs mt-1">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { icon: ClipboardList, label: "Attendance", value: attendance.total > 0 ? `${attendance.rate}%` : "—", sub: attendance.total > 0 ? `${attendance.total} days` : "No data" },
                  { icon: BookOpen, label: "Fees Outstanding", value: feeBalance > 0 ? `₵${feeBalance.toLocaleString()}` : "Cleared", sub: `${fees.length} invoice(s)` },
                  { icon: DollarSign, label: "Total Billed", value: `₵${fees.reduce((s, f) => s + f.amount, 0).toLocaleString()}`, sub: "All terms" },
                  { icon: FileText, label: "Total Paid", value: `₵${fees.reduce((s, f) => s + f.amountPaid, 0).toLocaleString()}`, sub: "Recorded" },
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
            </div>
          ))
        )}

        <Card className="border-border">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Recent Announcements</h3>
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements at this time.</p>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 5).map(a => (
                  <div key={a.id} className="py-3 border-b border-border last:border-0">
                    <p className="font-medium text-foreground text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{a.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center py-4">
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </main>
    </div>
  );
}
