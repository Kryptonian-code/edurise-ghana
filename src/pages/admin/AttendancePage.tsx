import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { students } from "@/lib/demo-data";

type Status = "present" | "absent" | "late" | "excused";

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState("JHS 2");
  const classStudents = students.filter(s => s.class.startsWith(selectedClass.split(" ")[0]));
  const [attendance, setAttendance] = useState<Record<string, Status>>({});

  const mark = (id: string, status: Status) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-header">Attendance</h1>
        <p className="text-sm text-muted-foreground">Mark and view daily attendance</p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["KG 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JHS 2", "JHS 3", "SHS 1"].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

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
              {(classStudents.length > 0 ? classStudents : students.slice(0, 4)).map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                  <TableCell className="font-mono text-xs">{s.studentId}</TableCell>
                  <TableCell>{statusIcon(attendance[s.id])}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
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
