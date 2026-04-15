import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, DollarSign, TrendingUp, UserPlus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { stats } from "@/lib/demo-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const enrollmentData = [
  { level: "Early Years", students: 85 },
  { level: "KG", students: 120 },
  { level: "Primary", students: 340 },
  { level: "JHS", students: 195 },
  { level: "SHS", students: 107 },
];

const feeData = [
  { name: "Paid", value: 2111000, color: "hsl(142, 76%, 36%)" },
  { name: "Outstanding", value: 345000, color: "hsl(0, 84%, 60%)" },
];

export default function AdminDashboard() {
  const statCards = [
    { icon: Users, label: "Total Students", value: stats.totalStudents.toLocaleString(), change: "+12 this term", color: "text-info" },
    { icon: GraduationCap, label: "Teachers", value: stats.totalTeachers.toString(), change: "62 active staff", color: "text-success" },
    { icon: UserPlus, label: "New Admissions", value: stats.newAdmissions.toString(), change: "This academic year", color: "text-warning" },
    { icon: DollarSign, label: "Revenue (GHS)", value: `₵${(stats.totalRevenue / 1000).toFixed(0)}K`, change: `₵${(stats.outstandingFees / 1000).toFixed(0)}K outstanding`, color: "text-primary" },
    { icon: CheckCircle, label: "Attendance Rate", value: `${stats.attendanceRate}%`, change: "Average this term", color: "text-success" },
    { icon: TrendingUp, label: "Pass Rate", value: `${stats.passRate}%`, change: "Last BECE results", color: "text-info" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-header">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">Welcome back. Here's what's happening at Prestige Academy.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="stat-card">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color}`} />
              </div>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs sm:text-sm font-medium text-foreground mt-1">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-foreground mb-4">Enrolment by Level</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 88%)" />
                <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="students" fill="hsl(163, 70%, 11%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-foreground mb-4">Fee Collection Summary</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={feeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {feeData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₵${(value / 1000).toFixed(0)}K`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 sm:gap-6 mt-2">
              {feeData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-muted-foreground">{d.name}: ₵{(d.value / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-bold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { icon: UserPlus, text: "New admission application from Kweku Appiah for Primary 1", time: "2 hours ago", color: "text-info" },
              { icon: DollarSign, text: "Fee payment of ₵1,500 received from Mr. Kofi Asante (Mobile Money)", time: "4 hours ago", color: "text-success" },
              { icon: AlertCircle, text: "3 students absent from JHS 2A today", time: "This morning", color: "text-warning" },
              { icon: CheckCircle, text: "Term 1 results uploaded for Primary 5", time: "Yesterday", color: "text-success" },
              { icon: Clock, text: "PTA meeting scheduled for 16th November", time: "2 days ago", color: "text-muted-foreground" },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <activity.icon className={`h-4 w-4 mt-0.5 ${activity.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
