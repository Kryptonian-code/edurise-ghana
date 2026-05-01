import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { students as demoStudents, type Student } from "@/lib/demo-data";
import { defaultSubjectsForClass, gradeFor } from "@/lib/report-card-store";
import { getSubjectScores, saveSubjectScores } from "@/lib/results-store";

const CLASSES = ["KG 1", "KG 2", "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JHS 1", "JHS 2", "JHS 3", "SHS 1", "SHS 2", "SHS 3"];
const TERMS = ["Term 1", "Term 2", "Term 3"];
const YEARS = ["2023/2024", "2024/2025", "2025/2026"];

function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem("pa_students");
    return raw ? JSON.parse(raw) : demoStudents;
  } catch { return demoStudents; }
}

interface Row { id: string; name: string; classScore: number; examScore: number; }

export default function ResultsPage() {
  const all = useMemo(() => loadStudents(), []);
  const [klass, setKlass] = useState("JHS 2");
  const [term, setTerm] = useState("Term 1");
  const [year, setYear] = useState("2024/2025");

  const subjects = useMemo(() => defaultSubjectsForClass(klass), [klass]);
  const [subject, setSubject] = useState(subjects[0]);

  useEffect(() => { setSubject(subjects[0]); }, [subjects]);

  const classStudents = useMemo(() => all.filter(s => s.class === klass && s.status === "Active"), [all, klass]);

  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const stored = getSubjectScores(year, term, klass, subject);
    setRows(classStudents.map(s => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      classScore: stored[s.id]?.classScore || 0,
      examScore: stored[s.id]?.examScore || 0,
    })));
  }, [classStudents, year, term, klass, subject]);

  const update = (id: string, field: "classScore" | "examScore", value: number) => {
    const max = 50;
    const v = Math.max(0, Math.min(max, isNaN(value) ? 0 : value));
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: v } : r));
  };

  const handleSave = () => {
    const map: Record<string, { classScore: number; examScore: number }> = {};
    rows.forEach(r => map[r.id] = { classScore: r.classScore, examScore: r.examScore });
    saveSubjectScores(year, term, klass, subject, map);
    toast.success(`Scores saved for ${subject} • ${klass} • ${term}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="dashboard-header">Results & Grading</h1>
          <p className="text-sm text-muted-foreground">Enter scores once. They appear automatically on each student's report card.</p>
        </div>
        <Button className="font-semibold" onClick={handleSave}>Save Scores</Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><Label className="text-xs">Class</Label>
              <Select value={klass} onValueChange={setKlass}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
            <p className="py-8 text-center text-sm text-muted-foreground">No active students in {klass}.</p>
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
