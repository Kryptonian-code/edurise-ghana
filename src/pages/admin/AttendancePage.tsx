import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, AlertCircle, Save, ClipboardList } from "lucide-react";
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
    displayStudents.forEach(s => { ids[s.id] = status; });
    setAttendance(prev => ({ ...prev, ...ids }));
  };

  const handleSave = () => {
    const key = `pa_attendance_${selectedClass}_${new Date().toISOString().split("T")[0]}`;
    localStorage.setItem(key, JSON.stringify(attendance));
    toast.success(`Attendance saved for ${selectedClass}. ${presentCount} of ${displayStudents.length} present.`);
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
        <Button className="font-semibold" onClick={handleSave} disabled={markedCount === 0}>
          <Save className="h-4 w-4 mr-2" />Save Attendance
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setAttendance({}); }}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["KG 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JHS 2", "JHS 3", "SHS 1"].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        <div className="sm:ml-auto">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => markAll("present")}>Mark All Present</Button>
        </div>
      </div>

      {markedCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

      {displayStudents.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-2">No Students in This Class</h3>
            <p className="text-sm text-muted-foreground">Select a different class or add students first.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="overflow-x-auto -mx-4 px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden sm:table-cell">Student ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mark Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayStudents.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium whitespace-nowrap">{s.firstName} {s.lastName}</TableCell>
                      <TableCell className="hidden sm:table-cell font-mono text-xs">{s.studentId}</TableCell>
                      <TableCell>{statusIcon(attendance[s.id])}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {(["present", "absent", "late", "excused"] as Status[]).map(st => (
                            <Button
                              key={st}
                              variant={attendance[s.id] === st ? "default" : "outline"}
                              size="sm"
                              className="text-xs capitalize h-7 px-2"
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
