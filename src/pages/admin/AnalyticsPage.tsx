import { Card, CardContent } from "@/components/ui/card";
import { stats } from "@/lib/demo-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const monthlyRevenue = [
  { month: "Sep", revenue: 850000 },
  { month: "Oct", revenue: 420000 },
  { month: "Nov", revenue: 380000 },
  { month: "Dec", revenue: 210000 },
  { month: "Jan", revenue: 596000 },
];

const attendanceTrend = [
  { week: "Week 1", rate: 97 },
  { week: "Week 2", rate: 95 },
  { week: "Week 3", rate: 96 },
  { week: "Week 4", rate: 94 },
  { week: "Week 5", rate: 96 },
  { week: "Week 6", rate: 98 },
];

const genderDist = [
  { name: "Male", value: 445, color: "hsl(163, 70%, 11%)" },
  { name: "Female", value: 402, color: "hsl(40, 35%, 82%)" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-header">Analytics</h1>
        <p className="text-sm text-muted-foreground">Insights and trends for school performance</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <h3 className="font-bold text-foreground mb-4">Monthly Fee Revenue (GHS)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₵${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => `₵${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="hsl(163, 70%, 11%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <h3 className="font-bold text-foreground mb-4">Weekly Attendance Rate (%)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 88%)" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={{ fill: "hsl(142, 76%, 36%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <h3 className="font-bold text-foreground mb-4">Gender Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={genderDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {genderDist.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <h3 className="font-bold text-foreground mb-4">Top Performing Students (JHS 2)</h3>
            <div className="space-y-3">
              {[
                { name: "Ama Mensah", avg: 97, pos: 1 },
                { name: "Abena Osei", avg: 94, pos: 2 },
                { name: "Kwame Asante", avg: 85, pos: 3 },
                { name: "Kofi Adjei", avg: 84, pos: 4 },
                { name: "Yaw Boateng", avg: 73, pos: 5 },
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-primary">{s.pos}</div>
                    <span className="text-sm font-medium text-foreground">{s.name}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{s.avg}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
