import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, AlertCircle, Save, ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ClassRow, listClasses, listStudents, StudentRow } from "@/lib/students-store";
import { AttendanceStatus, listAttendance, upsertAttendance } from "@/lib/attendance-store";

export default function AttendancePage() {
  const today = new Date().toISOString().split("T")[0];
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [date, setDate] = useState<string>(today);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [c, s] = await Promise.all([listClasses(), listStudents()]);
        setClasses(c);
        setStudents(s);
        if (c.length > 0 && !classId) setClassId(c[0].id);
      } catch (e: any) { toast.error(e.message || "Failed to load"); }
      finally { setLoading(false); }
    })();
  }, []);

  const classStudents = useMemo(
    () => students.filter(s => s.classId === classId),
    [students, classId]
  );

  // Load existing attendance whenever class/date changes
  useEffect(() => {
    if (!classId) return;
    (async () => {
      try {
        const rows = await listAttendance(classId, date);
        const map: Record<string, AttendanceStatus> = {};
        rows.forEach(r => { map[r.studentId] = r.status; });
        setAttendance(map);
      } catch (e: any) { toast.error(e.message || "Failed to load attendance"); }
    })();
  }, [classId, date]);

  const mark = (id: string, status: AttendanceStatus) => setAttendance(prev => ({ ...prev, [id]: status }));
  const markAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = { ...attendance };
    classStudents.forEach(s => { next[s.id] = status; });
    setAttendance(next);
  };

  const handleSave = async () => {
    const records = classStudents
      .filter(s => attendance[s.id])
      .map(s => ({ studentId: s.id, classId, date, status: attendance[s.id] }));
    if (records.length === 0) { toast.error("Mark at least one student"); return; }
    setSaving(true);
    try {
      await upsertAttendance(records);
      toast.success(`Saved ${records.length} record(s) for ${date}`);
    } catch (e: any) { toast.error(e.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const statusIcon = (status?: AttendanceStatus) => {
    switch (status) {
      case "present": return <CheckCircle className="h-4 w-4 text-success" />;
      case "absent": return <XCircle className="h-4 w-4 text-destructive" />;
      case "late": return <Clock className="h-4 w-4 text-warning" />;
      case "excused": return <AlertCircle className="h-4 w-4 text-info" />;
      default: return <span className="text-xs text-muted-foreground">Not marked</span>;
    }
  };

  const markedCount = classStudents.filter(s => attendance[s.id]).length;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-header">Attendance</h1>
          <p className="text-sm text-muted-foreground">Mark and view daily attendance</p>
        </div>
        <Button className="font-semibold" onClick={handleSave} disabled={markedCount === 0 || saving}>
          <Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save Attendance"}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Select class" /></SelectTrigger>
          <SelectContent>
            {classes.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        />
        <div className="sm:ml-auto">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => markAll("present")} disabled={classStudents.length === 0}>Mark All Present</Button>
        </div>
      </div>

      {markedCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["present", "absent", "late", "excused"] as const).map(st => (
            <Card key={st} className="border-border">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{classStudents.filter(s => attendance[s.id] === st).length}</p>
                <p className="text-xs text-muted-foreground capitalize">{st}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {classStudents.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-2">No Students in This Class</h3>
            <p className="text-sm text-muted-foreground">Select a different class or enroll students first.</p>
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
                    <TableHead className="hidden sm:table-cell">Admission #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classStudents.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium whitespace-nowrap">{s.firstName} {s.lastName}</TableCell>
                      <TableCell className="hidden sm:table-cell font-mono text-xs">{s.admissionNumber}</TableCell>
                      <TableCell>{statusIcon(attendance[s.id])}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {(["present", "absent", "late", "excused"] as AttendanceStatus[]).map(st => (
                            <Button key={st} variant={attendance[s.id] === st ? "default" : "outline"} size="sm"
                              className="text-xs capitalize h-7 px-2" onClick={() => mark(s.id, st)}>
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
