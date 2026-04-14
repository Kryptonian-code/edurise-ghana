import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, AlertCircle, Save } from "lucide-react";
import { useState } from "react";
import { students } from "@/lib/demo-data";
import { toast } from "sonner";

type Status = "present" | "absent" | "late" | "excused";

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState("JHS 2");
  const classStudents = students.filter(s => s.class.startsWith(selectedClass.split(" ")[0]));
  const [attendance, setAttendance] = useState<Record<string, Status>>({});

  const mark = (id: string, status: Status) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const markAll = (status: Status) => {
    const ids: Record<string, Status> = {};
    (classStudents.length > 0 ? classStudents : students.slice(0, 4)).forEach(s => { ids[s.id] = status; });
    setAttendance(prev => ({ ...prev, ...ids }));
  };

  const statusIcon = (status?: Status) => {
    switch (status) {
      case "present": return <CheckCircle className="h-4 w-4 text-success" />;
      case "absent": return <XCircle className="h-4 w-4 text-destructive" />;
      case "late": return <Clock className="h-4 w-4 text-warning" />;
      case "excused": return <AlertCircle className="h-4 w-4 text-info" />;
      default: return <span className="text-xs text-muted-foreground">Not marked</span>;
    }
  };

  const displayStudents = classStudents.length > 0 ? classStudents : students.slice(0, 4);
  const markedCount = displayStudents.filter(s => attendance[s.id]).length;
  const presentCount = displayStudents.filter(s => attendance[s.id] === "present").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-header">Attendance</h1>
          <p className="text-sm text-muted-foreground">Mark and view daily attendance</p>
        </div>
        <Button className="font-semibold" onClick={() => toast.success(`Attendance saved! ${presentCount} of ${displayStudents.length} present.`)} disabled={markedCount === 0}>
          <Save className="h-4 w-4 mr-2" />Save Attendance
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setAttendance({}); }}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["KG 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JHS 2", "JHS 3", "SHS 1"].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        <div className="flex gap-1 ml-auto">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => markAll("present")}>Mark All Present</Button>
        </div>
      </div>

      {markedCount > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Present", count: displayStudents.filter(s => attendance[s.id] === "present").length, color: "text-success" },
            { label: "Absent", count: displayStudents.filter(s => attendance[s.id] === "absent").length, color: "text-destructive" },
            { label: "Late", count: displayStudents.filter(s => attendance[s.id] === "late").length, color: "text-warning" },
            { label: "Excused", count: displayStudents.filter(s => attendance[s.id] === "excused").length, color: "text-info" },
          ].map(stat => (
            <Card key={stat.label} className="border-border">
              <CardContent className="p-3 text-center">
                <p className={`text-xl font-bold ${stat.color}`}>{stat.count}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-border">
        <CardContent className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mark Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayStudents.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                  <TableCell className="font-mono text-xs">{s.studentId}</TableCell>
                  <TableCell>{statusIcon(attendance[s.id])}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {(["present", "absent", "late", "excused"] as Status[]).map(st => (
                        <Button
                          key={st}
                          variant={attendance[s.id] === st ? "default" : "outline"}
                          size="sm"
                          className="text-xs capitalize h-7"
                          onClick={() => mark(s.id, st)}
                        >
                          {st}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
