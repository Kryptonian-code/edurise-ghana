import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Printer, Save, Plus, Trash2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import type { Student } from "@/lib/demo-data";
import { students as demoStudents } from "@/lib/demo-data";
import {
  buildDefaultReportCard,
  defaultSubjectsForClass,
  getReportCard,
  gradeFor,
  saveReportCard,
  type ReportCard,
} from "@/lib/report-card-store";
import { getStudentTermScores } from "@/lib/results-store";
import { getBranding } from "@/lib/branding-store";

const TERMS = ["Term 1", "Term 2", "Term 3"];
const ACADEMIC_YEARS = ["2023/2024", "2024/2025", "2025/2026"];

function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem("pa_students");
    return raw ? JSON.parse(raw) : demoStudents;
  } catch {
    return demoStudents;
  }
}

export default function ReportCardPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const year = params.get("year") || "2024/2025";
  const term = params.get("term") || "Term 1";

  const students = useMemo(() => loadStudents(), []);
  const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);
  const schoolInfo = useMemo(() => getBranding(), []);

  const [card, setCard] = useState<ReportCard | null>(null);

  useEffect(() => {
    if (!student) return;
    const existing = getReportCard(student.id, year, term);
    const fromResults = getStudentTermScores(student.id, year, term, student.class);

    if (existing) {
      // Merge in any new subjects from Results that aren't on the saved card
      const known = new Set(existing.subjects.map(s => s.subject));
      const merged = [...existing.subjects];
      for (const r of fromResults) {
        if (!known.has(r.subject)) {
          merged.push({ subject: r.subject, classScore: r.classScore, examScore: r.examScore, remark: "" });
        } else {
          // Update scores from Results if user hasn't manually overridden (i.e. saved card had 0s)
          const idx = merged.findIndex(m => m.subject === r.subject);
          if (idx >= 0 && merged[idx].classScore === 0 && merged[idx].examScore === 0) {
            merged[idx] = { ...merged[idx], classScore: r.classScore, examScore: r.examScore };
          }
        }
      }
      setCard({ ...existing, subjects: merged });
    } else {
      const base = buildDefaultReportCard(student.id, student.class, year, term);
      const subjectMap = new Map(base.subjects.map(s => [s.subject, s]));
      for (const r of fromResults) {
        subjectMap.set(r.subject, { subject: r.subject, classScore: r.classScore, examScore: r.examScore, remark: "" });
      }
      // Ensure default subjects always appear in canonical order
      const ordered = [
        ...defaultSubjectsForClass(student.class).map(s => subjectMap.get(s)!).filter(Boolean),
        ...Array.from(subjectMap.values()).filter(s => !defaultSubjectsForClass(student.class).includes(s.subject)),
      ];
      setCard({ ...base, subjects: ordered });
    }
  }, [student, year, term]);


  if (!student) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/students")}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Students
        </Button>
        <Card><CardContent className="p-12 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-bold text-lg">Student Not Found</h2>
          <p className="text-sm text-muted-foreground">The student record you're looking for doesn't exist.</p>
        </CardContent></Card>
      </div>
    );
  }

  if (!card) return null;

  const updateSubject = (idx: number, patch: Partial<ReportCard["subjects"][number]>) => {
    setCard(prev => prev ? { ...prev, subjects: prev.subjects.map((s, i) => i === idx ? { ...s, ...patch } : s) } : prev);
  };

  const addSubject = () => {
    setCard(prev => prev ? { ...prev, subjects: [...prev.subjects, { subject: "", classScore: 0, examScore: 0, remark: "" }] } : prev);
  };

  const removeSubject = (idx: number) => {
    setCard(prev => prev ? { ...prev, subjects: prev.subjects.filter((_, i) => i !== idx) } : prev);
  };

  const handleSave = () => {
    if (!card) return;
    if (card.subjects.some(s => !s.subject.trim())) {
      toast.error("Please name every subject before saving.");
      return;
    }
    saveReportCard(card);
    toast.success("Report card saved.");
  };

  const handlePrint = () => {
    handleSave();
    setTimeout(() => window.print(), 100);
  };

  const totals = card.subjects.map(s => Math.min(100, Math.max(0, (s.classScore || 0) + (s.examScore || 0))));
  const aggregate = totals.reduce((a, b) => a + b, 0);
  const average = totals.length ? aggregate / totals.length : 0;
  const overall = gradeFor(average);
  const attendancePct = card.attendanceTotal && card.attendanceTotal > 0
    ? Math.round(((card.attendancePresent || 0) / card.attendanceTotal) * 100)
    : null;

  return (
    <div className="space-y-6">
      {/* Toolbar (hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/students")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <div>
            <h1 className="dashboard-header">Report Card</h1>
            <p className="text-sm text-muted-foreground">{student.firstName} {student.lastName} • {student.class}{student.stream ? ` (${student.stream})` : ""}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={year} onValueChange={v => { params.set("year", v); setParams(params); }}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{ACADEMIC_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={term} onValueChange={v => { params.set("term", v); setParams(params); }}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>{TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save</Button>
          <Button onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Download / Print PDF</Button>
        </div>
      </div>

      {/* Editor (hidden when printing) */}
      <Card className="no-print border-border">
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div>
            <h2 className="font-bold text-foreground mb-3">Subject Scores</h2>
            <p className="text-xs text-muted-foreground mb-3">Class score is out of 50, exam score is out of 50. Total is calculated automatically.</p>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-2">Subject</th>
                    <th className="py-2 px-2 text-center">Class (50)</th>
                    <th className="py-2 px-2 text-center">Exam (50)</th>
                    <th className="py-2 px-2 text-center">Total</th>
                    <th className="py-2 px-2 text-center">Grade</th>
                    <th className="py-2 px-2">Subject Remark</th>
                    <th className="py-2 pl-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {card.subjects.map((s, i) => {
                    const total = Math.min(100, Math.max(0, (s.classScore || 0) + (s.examScore || 0)));
                    const g = gradeFor(total);
                    return (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-2 pr-2"><Input value={s.subject} onChange={e => updateSubject(i, { subject: e.target.value })} /></td>
                        <td className="py-2 px-2"><Input type="number" min={0} max={50} value={s.classScore} onChange={e => updateSubject(i, { classScore: Math.min(50, Math.max(0, +e.target.value || 0)) })} className="w-20 text-center mx-auto" /></td>
                        <td className="py-2 px-2"><Input type="number" min={0} max={50} value={s.examScore} onChange={e => updateSubject(i, { examScore: Math.min(50, Math.max(0, +e.target.value || 0)) })} className="w-20 text-center mx-auto" /></td>
                        <td className="py-2 px-2 text-center font-semibold">{total}</td>
                        <td className="py-2 px-2 text-center font-semibold">{g.grade}</td>
                        <td className="py-2 px-2"><Input value={s.remark || ""} onChange={e => updateSubject(i, { remark: e.target.value })} placeholder={g.remark} /></td>
                        <td className="py-2 pl-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeSubject(i)}><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Button variant="outline" size="sm" className="mt-3" onClick={addSubject}><Plus className="h-4 w-4 mr-2" />Add Subject</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Days Present</Label>
              <Input type="number" min={0} value={card.attendancePresent ?? 0} onChange={e => setCard({ ...card, attendancePresent: Math.max(0, +e.target.value || 0) })} className="mt-1" />
            </div>
            <div>
              <Label>School Days</Label>
              <Input type="number" min={0} value={card.attendanceTotal ?? 0} onChange={e => setCard({ ...card, attendanceTotal: Math.max(0, +e.target.value || 0) })} className="mt-1" />
            </div>
            <div>
              <Label>Conduct</Label>
              <Input value={card.conduct || ""} onChange={e => setCard({ ...card, conduct: e.target.value })} className="mt-1" placeholder="e.g. Excellent" />
            </div>
            <div>
              <Label>Attitude to Work</Label>
              <Input value={card.attitude || ""} onChange={e => setCard({ ...card, attitude: e.target.value })} className="mt-1" placeholder="e.g. Very Good" />
            </div>
            <div className="sm:col-span-2">
              <Label>Position in Class (optional)</Label>
              <Input value={card.position || ""} onChange={e => setCard({ ...card, position: e.target.value })} className="mt-1" placeholder="e.g. 3rd out of 28" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label>Class Teacher's Remark</Label>
              <Textarea rows={3} value={card.classTeacherRemark || ""} onChange={e => setCard({ ...card, classTeacherRemark: e.target.value })} className="mt-1" placeholder="A focused and disciplined learner. Keep it up." />
            </div>
            <div>
              <Label>Headteacher's Remark</Label>
              <Textarea rows={3} value={card.headteacherRemark || ""} onChange={e => setCard({ ...card, headteacherRemark: e.target.value })} className="mt-1" placeholder="A commendable performance. Aim higher next term." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Printable Report Card */}
      <div className="print-area mx-auto bg-white text-black shadow-md border border-border" style={{ width: "210mm", minHeight: "297mm", padding: "14mm" }}>
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#062f26" }}>
              <GraduationCap className="h-9 w-9" style={{ color: "#d7c7a3" }} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold uppercase tracking-tight" style={{ color: "#062f26" }}>{schoolInfo.name}</h1>
              <p className="text-xs italic">{schoolInfo.motto}</p>
              <p className="text-xs">{schoolInfo.address}</p>
              <p className="text-xs">Tel: {schoolInfo.phone} • {schoolInfo.email}</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold uppercase tracking-wider" style={{ color: "#062f26" }}>Terminal Report</p>
            <p>{card.academicYear}</p>
            <p>{card.term}</p>
          </div>
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-4 text-sm">
          <InfoRow label="Student Name" value={`${student.firstName} ${student.lastName}`} />
          <InfoRow label="Student ID" value={student.studentId} />
          <InfoRow label="Class" value={`${student.class}${student.stream ? ` (${student.stream})` : ""}`} />
          <InfoRow label="Gender" value={student.gender} />
          <InfoRow label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-GB") : "—"} />
          <InfoRow label="Guardian" value={student.guardian} />
          {card.position && <InfoRow label="Position" value={card.position} />}
          <InfoRow label="Date Generated" value={new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
        </div>

        {/* Subjects table */}
        <table className="w-full mt-5 text-sm border-collapse" style={{ borderColor: "#062f26" }}>
          <thead>
            <tr style={{ backgroundColor: "#062f26", color: "#d7c7a3" }}>
              <th className="text-left p-2 font-semibold">Subject</th>
              <th className="text-center p-2 font-semibold w-16">Class<br/>(50)</th>
              <th className="text-center p-2 font-semibold w-16">Exam<br/>(50)</th>
              <th className="text-center p-2 font-semibold w-16">Total<br/>(100)</th>
              <th className="text-center p-2 font-semibold w-14">Grade</th>
              <th className="text-left p-2 font-semibold">Remark</th>
            </tr>
          </thead>
          <tbody>
            {card.subjects.map((s, i) => {
              const total = Math.min(100, Math.max(0, (s.classScore || 0) + (s.examScore || 0)));
              const g = gradeFor(total);
              return (
                <tr key={i} className="border-b" style={{ borderColor: "#cccccc" }}>
                  <td className="p-2">{s.subject || "—"}</td>
                  <td className="p-2 text-center">{s.classScore}</td>
                  <td className="p-2 text-center">{s.examScore}</td>
                  <td className="p-2 text-center font-semibold">{total}</td>
                  <td className="p-2 text-center font-semibold">{g.grade}</td>
                  <td className="p-2">{s.remark || g.remark}</td>
                </tr>
              );
            })}
            {card.subjects.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-xs italic">No subjects recorded.</td></tr>
            )}
          </tbody>
        </table>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
          <SummaryBox label="Total Score" value={`${aggregate} / ${card.subjects.length * 100}`} />
          <SummaryBox label="Average" value={`${average.toFixed(1)}%`} />
          <SummaryBox label="Overall Grade" value={overall.grade} />
          <SummaryBox label="Attendance" value={attendancePct !== null ? `${card.attendancePresent}/${card.attendanceTotal} (${attendancePct}%)` : "—"} />
        </div>

        {/* Conduct & Attitude */}
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="border p-2" style={{ borderColor: "#062f26" }}><span className="font-semibold">Conduct:</span> {card.conduct || "—"}</div>
          <div className="border p-2" style={{ borderColor: "#062f26" }}><span className="font-semibold">Attitude to Work:</span> {card.attitude || "—"}</div>
        </div>

        {/* Remarks */}
        <div className="mt-5 space-y-3 text-sm">
          <RemarkBlock title="Class Teacher's Remark" body={card.classTeacherRemark} signLabel="Class Teacher" />
          <RemarkBlock title="Headteacher's Remark" body={card.headteacherRemark} signLabel="Headteacher" />
        </div>

        {/* Grading key */}
        <div className="mt-5 text-[10px] border-t pt-2" style={{ borderColor: "#062f26" }}>
          <p className="font-semibold mb-1">Grading Key (WAEC Standard)</p>
          <p>A1: 80–100 Excellent • B2: 75–79 Very Good • B3: 70–74 Good • C4–C6: 55–69 Credit • D7–E8: 45–54 Pass • F9: Below 45 Fail</p>
          <p className="mt-2 italic">This is a computer-generated report card. {schoolInfo.name} • {schoolInfo.website}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="font-semibold min-w-[110px]">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border p-2 text-center" style={{ borderColor: "#062f26" }}>
      <p className="text-[10px] uppercase tracking-wider">{label}</p>
      <p className="font-bold text-base" style={{ color: "#062f26" }}>{value}</p>
    </div>
  );
}

function RemarkBlock({ title, body, signLabel }: { title: string; body?: string; signLabel: string }) {
  return (
    <div>
      <p className="font-semibold mb-1">{title}</p>
      <div className="border p-3 min-h-[48px]" style={{ borderColor: "#062f26" }}>{body || <span className="italic text-gray-500">No remark provided.</span>}</div>
      <div className="flex justify-end mt-1 text-[11px]">
        <div className="text-center">
          <div className="border-t border-black w-48 pt-1">{signLabel}'s Signature</div>
        </div>
      </div>
    </div>
  );
}
