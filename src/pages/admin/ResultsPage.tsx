import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { defaultSubjectsForClass, gradeFor } from "@/lib/report-card-store";
import { getSubjectScores, saveSubjectScores } from "@/lib/results-store";
import { listStudents, listClasses, type StudentRow, type ClassRow } from "@/lib/students-store";
import { Loader2 } from "lucide-react";
import { logAudit } from "@/lib/audit";

const TERMS = ["Term 1", "Term 2", "Term 3"];
const YEARS = ["2023/2024", "2024/2025", "2025/2026"];

interface Row { id: string; name: string; classScore: number; examScore: number; }

export default function ResultsPage() {
  const [allStudents, setAllStudents] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [klass, setKlass] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [year, setYear] = useState("2024/2025");
  const [subject, setSubject] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([listStudents(), listClasses()]).then(([s, c]) => {
      setAllStudents(s); setClasses(c);
      if (c.length && !klass) setKlass(c[0].name);
      setLoading(false);
    }).catch(e => { toast.error(e.message || "Failed to load data."); setLoading(false); });
  }, []);

  const subjects = useMemo(() => defaultSubjectsForClass(klass), [klass]);
  useEffect(() => { if (subjects.length && !subjects.includes(subject)) setSubject(subjects[0]); }, [subjects]);

  const currentClass = classes.find(c => c.name === klass);
  const classStudents = useMemo(
    () => allStudents.filter(s => s.className === klass && s.status === "active"),
    [allStudents, klass]
  );

  useEffect(() => {
    if (!klass || !subject || !currentClass) { setRows([]); return; }
    getSubjectScores(year, term, currentClass.id, subject).then(stored => {
      setRows(classStudents.map(s => ({
        id: s.id, name: `${s.firstName} ${s.lastName}`,
        classScore: stored[s.id]?.classScore || 0,
        examScore: stored[s.id]?.examScore || 0,
      })));
    });
  }, [classStudents, year, term, klass, subject, currentClass?.id]);

  const update = (id: string, field: "classScore" | "examScore", value: number) => {
    const v = Math.max(0, Math.min(50, isNaN(value) ? 0 : value));
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: v } : r));
  };

  const handleSave = async () => {
    if (!currentClass) { toast.error("Pick a valid class."); return; }
    setSaving(true);
    try {
      const map: Record<string, { classScore: number; examScore: number }> = {};
      rows.forEach(r => map[r.id] = { classScore: r.classScore, examScore: r.examScore });
      await saveSubjectScores(year, term, currentClass.id, subject, map);
      toast.success(`Scores saved for ${subject} • ${klass} • ${term}.`);
      logAudit("results.save", "subject", `${currentClass.id}:${subject}:${term}:${year}`, { count: rows.length });
    } catch (e: any) { toast.error(e.message || "Couldn't save scores."); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const classOptions = classes.length ? classes.map(c => c.name) : ["JHS 2"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="dashboard-header">Results & Grading</h1>
          <p className="text-sm text-muted-foreground">Enter scores once. They appear automatically on each student's report card.</p>
        </div>
        <Button className="font-semibold" onClick={handleSave} disabled={saving || !currentClass}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Scores</Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><Label className="text-xs">Class</Label>
              <Select value={klass} onValueChange={setKlass}><SelectTrigger className="mt-1"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Subject</Label>
              <Select value={subject} onValueChange={setSubject}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Term</Label>
              <Select value={term} onValueChange={setTerm}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Academic Year</Label>
              <Select value={year} onValueChange={setYear}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No active students in {klass || "(select a class)"}.</p>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">Class Score (50)</TableHead>
                    <TableHead className="text-center">Exam Score (50)</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Remark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...rows].sort((a, b) => (b.classScore + b.examScore) - (a.classScore + a.examScore)).map(r => {
                    const total = r.classScore + r.examScore;
                    const g = gradeFor(total);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-center"><Input type="number" min={0} max={50} value={r.classScore} onChange={e => update(r.id, "classScore", +e.target.value)} className="w-20 text-center mx-auto" /></TableCell>
                        <TableCell className="text-center"><Input type="number" min={0} max={50} value={r.examScore} onChange={e => update(r.id, "examScore", +e.target.value)} className="w-20 text-center mx-auto" /></TableCell>
                        <TableCell className="text-center font-bold">{total}</TableCell>
                        <TableCell className="text-center font-bold">{g.grade}</TableCell>
                        <TableCell className="text-center text-sm hidden sm:table-cell">{g.remark}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
