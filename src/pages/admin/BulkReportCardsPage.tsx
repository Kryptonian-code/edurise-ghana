import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchBranding, type SchoolBranding } from "@/lib/branding-store";
import { defaultSubjectsForClass, getReportCard, gradeFor } from "@/lib/report-card-store";
import { getStudentTermScores } from "@/lib/results-store";
import { listStudents, type StudentRow } from "@/lib/students-store";

const CLASSES = ["Crèche", "Nursery 1", "Nursery 2", "KG 1", "KG 2", "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JHS 1", "JHS 2", "JHS 3", "SHS 1", "SHS 2", "SHS 3"];
const TERMS = ["Term 1", "Term 2", "Term 3"];
const YEARS = ["2023/2024", "2024/2025", "2025/2026"];

interface PrintableSubject { subject: string; classScore: number; examScore: number; remark?: string; }

interface PreparedCard { student: StudentRow; subjects: PrintableSubject[]; }

async function buildSubjectsForStudent(student: StudentRow, year: string, term: string): Promise<PrintableSubject[]> {
  const klass = student.className || "";
  const [fromResults, saved] = await Promise.all([
    getStudentTermScores(student.id, year, term),
    getReportCard(student.id, year, term),
  ]);
  const map = new Map<string, PrintableSubject>();
  for (const s of defaultSubjectsForClass(klass)) map.set(s, { subject: s, classScore: 0, examScore: 0 });
  for (const s of fromResults) map.set(s.subject, { subject: s.subject, classScore: s.classScore, examScore: s.examScore });
  if (saved) {
    for (const s of saved.subjects) {
      const existing = map.get(s.subject);
      if (!existing || ((s.classScore || s.examScore) && !fromResults.find(r => r.subject === s.subject))) {
        map.set(s.subject, { subject: s.subject, classScore: s.classScore, examScore: s.examScore, remark: s.remark });
      }
    }
  }
  return Array.from(map.values());
}

export default function BulkReportCardsPage() {
  const navigate = useNavigate();
  const [branding, setBranding] = useState<SchoolBranding | null>(null);
  const [allStudents, setAllStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [klass, setKlass] = useState("JHS 2");
  const [term, setTerm] = useState("Term 1");
  const [year, setYear] = useState("2024/2025");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [prepared, setPrepared] = useState<PreparedCard[] | null>(null);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    Promise.all([fetchBranding(), listStudents()]).then(([b, s]) => {
      setBranding(b); setAllStudents(s);
    }).finally(() => setLoading(false));
  }, []);

  const classStudents = useMemo(
    () => allStudents.filter(s => s.className === klass && s.status === "active"),
    [allStudents, klass]
  );
  const allSelected = classStudents.length > 0 && classStudents.every(s => selected[s.id]);
  const toggleAll = (v: boolean) => {
    const next: Record<string, boolean> = {};
    if (v) classStudents.forEach(s => next[s.id] = true);
    setSelected(next);
  };
  const chosen = classStudents.filter(s => selected[s.id]);

  const handleGenerate = async () => {
    if (chosen.length === 0) { toast.error("Select at least one student."); return; }
    setPreparing(true);
    try {
      const cards = await Promise.all(chosen.map(async (student) => ({
        student, subjects: await buildSubjectsForStudent(student, year, term),
      })));
      setPrepared(cards);
      toast.success(`Prepared ${cards.length} report card${cards.length === 1 ? "" : "s"}.`);
    } catch (e: any) { toast.error(e.message || "Couldn't prepare report cards."); }
    finally { setPreparing(false); }
  };

  const handlePrint = async () => {
    if (!prepared || prepared.length === 0) await handleGenerate();
    setTimeout(() => window.print(), 200);
  };

  if (loading || !branding) return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/students")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Students
          </Button>
          <div>
            <h1 className="dashboard-header">Bulk Report Cards</h1>
            <p className="text-sm text-muted-foreground">Generate printable PDFs for an entire class.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerate} disabled={preparing}>{preparing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Prepare</Button>
          <Button onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Download / Print PDF</Button>
        </div>
      </div>

      <Card className="no-print border-border">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Class</Label>
              <Select value={klass} onValueChange={v => { setKlass(v); setSelected({}); setPrepared(null); }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Term</Label>
              <Select value={term} onValueChange={v => { setTerm(v); setPrepared(null); }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Academic Year</Label>
              <Select value={year} onValueChange={v => { setYear(v); setPrepared(null); }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="border border-border rounded-lg">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Checkbox checked={allSelected} onCheckedChange={(v) => toggleAll(!!v)} id="all" />
                <Label htmlFor="all" className="cursor-pointer">Select all in {klass}</Label>
              </div>
              <Badge variant="secondary">{chosen.length}/{classStudents.length} selected</Badge>
            </div>
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {classStudents.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">No active students in {klass}.</p>
              )}
              {classStudents.map(s => (
                <label key={s.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/40">
                  <Checkbox checked={!!selected[s.id]} onCheckedChange={(v) => setSelected(prev => ({ ...prev, [s.id]: !!v }))} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{s.admissionNumber}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {prepared && prepared.length > 0 && (
        <div className="bulk-print-area space-y-6">
          {prepared.map(({ student, subjects }) => {
            const totals = subjects.map(s => Math.min(100, (s.classScore || 0) + (s.examScore || 0)));
            const aggregate = totals.reduce((a, b) => a + b, 0);
            const average = totals.length ? aggregate / totals.length : 0;
            const overall = gradeFor(average);
            return (
              <div key={student.id} className="report-page mx-auto bg-white text-black border border-border" style={{ width: "210mm", minHeight: "297mm", padding: "14mm", pageBreakAfter: "always" }}>
                <div className="flex items-start justify-between border-b-2 pb-4" style={{ borderColor: "#062f26" }}>
                  <div className="flex items-center gap-3">
                    {branding.logoUrl ? (
                      <img src={branding.logoUrl} alt={branding.name} className="h-16 w-16 object-contain rounded" />
                    ) : (
                      <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#062f26" }}>
                        <GraduationCap className="h-9 w-9" style={{ color: "#d7c7a3" }} />
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-extrabold uppercase tracking-tight" style={{ color: "#062f26" }}>{branding.name}</h1>
                      <p className="text-xs italic">{branding.motto}</p>
                      <p className="text-xs">{branding.address}</p>
                      <p className="text-xs">Tel: {branding.phone} • {branding.email}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold uppercase tracking-wider" style={{ color: "#062f26" }}>Terminal Report</p>
                    <p>{year}</p><p>{term}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-4 text-sm">
                  <Info label="Student Name" value={`${student.firstName} ${student.lastName}`} />
                  <Info label="Admission No." value={student.admissionNumber} />
                  <Info label="Class" value={student.className || "—"} />
                  <Info label="Gender" value={student.gender || "—"} />
                  <Info label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-GB") : "—"} />
                  <Info label="Guardian" value={student.guardianName || "—"} />
                </div>

                <table className="w-full mt-5 text-sm border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: "#062f26", color: "#d7c7a3" }}>
                      <th className="text-left p-2">Subject</th>
                      <th className="text-center p-2 w-16">Class<br/>(50)</th>
                      <th className="text-center p-2 w-16">Exam<br/>(50)</th>
                      <th className="text-center p-2 w-16">Total</th>
                      <th className="text-center p-2 w-14">Grade</th>
                      <th className="text-left p-2">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s, i) => {
                      const total = Math.min(100, (s.classScore || 0) + (s.examScore || 0));
                      const g = gradeFor(total);
                      return (
                        <tr key={i} className="border-b" style={{ borderColor: "#cccccc" }}>
                          <td className="p-2">{s.subject}</td>
                          <td className="p-2 text-center">{s.classScore}</td>
                          <td className="p-2 text-center">{s.examScore}</td>
                          <td className="p-2 text-center font-semibold">{total}</td>
                          <td className="p-2 text-center font-semibold">{g.grade}</td>
                          <td className="p-2">{s.remark || g.remark}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="grid grid-cols-4 gap-3 mt-4 text-sm">
                  <Box label="Total" value={`${aggregate} / ${subjects.length * 100}`} />
                  <Box label="Average" value={`${average.toFixed(1)}%`} />
                  <Box label="Grade" value={overall.grade} />
                  <Box label="Remark" value={overall.remark} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <Sign label="Class Teacher" />
                  <Sign label="Headteacher" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex gap-2"><span className="font-semibold min-w-[110px]">{label}:</span><span>{value}</span></div>;
}
function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="border p-2 text-center" style={{ borderColor: "#062f26" }}>
      <p className="text-[10px] uppercase tracking-wider">{label}</p>
      <p className="font-bold text-base" style={{ color: "#062f26" }}>{value}</p>
    </div>
  );
}
function Sign({ label }: { label: string }) {
  return (
    <div className="text-xs">
      <div className="border-b border-black h-10" />
      <p className="mt-1 text-center">{label}'s Signature & Date</p>
    </div>
  );
}
