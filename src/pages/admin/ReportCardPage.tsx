import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Printer, Save, Plus, Trash2, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  buildDefaultReportCard, defaultSubjectsForClass, getReportCard, gradeFor, saveReportCard,
  type ReportCard,
} from "@/lib/report-card-store";
import { getStudentTermScores } from "@/lib/results-store";
import { fetchBranding, type SchoolBranding } from "@/lib/branding-store";
import { getStudent, type StudentRow } from "@/lib/students-store";

const TERMS = ["Term 1", "Term 2", "Term 3"];
const ACADEMIC_YEARS = ["2023/2024", "2024/2025", "2025/2026"];

export default function ReportCardPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const year = params.get("year") || "2024/2025";
  const term = params.get("term") || "Term 1";

  const [student, setStudent] = useState<StudentRow | null>(null);
  const [schoolInfo, setSchoolInfo] = useState<SchoolBranding | null>(null);
  const [card, setCard] = useState<ReportCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    Promise.all([getStudent(studentId), fetchBranding()])
      .then(([s, b]) => { setStudent(s); setSchoolInfo(b); })
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (!student) return;
    (async () => {
      const klass = student.className || "";
      const [existing, fromResults] = await Promise.all([
        getReportCard(student.id, year, term),
        getStudentTermScores(student.id, year, term),
      ]);

      if (existing) {
        const known = new Set(existing.subjects.map(s => s.subject));
        const merged = [...existing.subjects];
        for (const r of fromResults) {
          if (!known.has(r.subject)) {
            merged.push({ subject: r.subject, classScore: r.classScore, examScore: r.examScore, remark: "" });
          } else {
            const idx = merged.findIndex(m => m.subject === r.subject);
            if (idx >= 0 && merged[idx].classScore === 0 && merged[idx].examScore === 0) {
              merged[idx] = { ...merged[idx], classScore: r.classScore, examScore: r.examScore };
            }
          }
        }
        setCard({ ...existing, subjects: merged });
      } else {
        const base = buildDefaultReportCard(student.id, klass, year, term, student.classId || null);
        const subjectMap = new Map(base.subjects.map(s => [s.subject, s]));
        for (const r of fromResults) {
          subjectMap.set(r.subject, { subject: r.subject, classScore: r.classScore, examScore: r.examScore, remark: "" });
        }
        const ordered = [
          ...defaultSubjectsForClass(klass).map(s => subjectMap.get(s)!).filter(Boolean),
          ...Array.from(subjectMap.values()).filter(s => !defaultSubjectsForClass(klass).includes(s.subject)),
        ];
        setCard({ ...base, subjects: ordered });
      }
    })();
  }, [student, year, term]);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  if (!student) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/students")}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Students
        </Button>
        <Card><CardContent className="p-12 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-bold text-lg">Student Not Found</h2>
        </CardContent></Card>
      </div>
    );
  }

  if (!card || !schoolInfo) return null;

  const updateSubject = (idx: number, patch: Partial<ReportCard["subjects"][number]>) => {
    setCard(prev => prev ? { ...prev, subjects: prev.subjects.map((s, i) => i === idx ? { ...s, ...patch } : s) } : prev);
  };
  const addSubject = () => setCard(prev => prev ? { ...prev, subjects: [...prev.subjects, { subject: "", classScore: 0, examScore: 0, remark: "" }] } : prev);
  const removeSubject = (idx: number) => setCard(prev => prev ? { ...prev, subjects: prev.subjects.filter((_, i) => i !== idx) } : prev);

  const handleSave = async () => {
    if (!card) return;
    if (card.subjects.some(s => !s.subject.trim())) { toast.error("Please name every subject before saving."); return; }
    setSaving(true);
    try {
      const saved = await saveReportCard(card);
      setCard(saved);
      toast.success("Report card saved.");
    } catch (e: any) { toast.error(e.message || "Couldn't save report card."); }
    finally { setSaving(false); }
  };

  const handlePrint = async () => { await handleSave(); setTimeout(() => window.print(), 100); };

  const totals = card.subjects.map(s => Math.min(100, Math.max(0, (s.classScore || 0) + (s.examScore || 0))));
  const aggregate = totals.reduce((a, b) => a + b, 0);
  const average = totals.length ? aggregate / totals.length : 0;
  const overall = gradeFor(average);
  const attendancePct = card.attendanceTotal && card.attendanceTotal > 0
    ? Math.round(((card.attendancePresent || 0) / card.attendanceTotal) * 100) : null;

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/students")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <div>
            <h1 className="dashboard-header">Report Card</h1>
            <p className="text-sm text-muted-foreground">{student.firstName} {student.lastName} • {student.className || "—"}</p>
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
          <Button variant="outline" onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save</Button>
          <Button onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Download / Print PDF</Button>
        </div>
      </div>

      <Card className="no-print border-border">
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div>
            <h2 className="font-bold text-foreground mb-3">Subject Scores</h2>
            <p className="text-xs text-muted-foreground mb-3">Class score is out of 50, exam score is out of 50.</p>
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
            <div><Label>Days Present</Label><Input type="number" min={0} value={card.attendancePresent ?? 0} onChange={e => setCard({ ...card, attendancePresent: Math.max(0, +e.target.value || 0) })} className="mt-1" /></div>
            <div><Label>School Days</Label><Input type="number" min={0} value={card.attendanceTotal ?? 0} onChange={e => setCard({ ...card, attendanceTotal: Math.max(0, +e.target.value || 0) })} className="mt-1" /></div>
            <div><Label>Conduct</Label><Input value={card.conduct || ""} onChange={e => setCard({ ...card, conduct: e.target.value })} className="mt-1" /></div>
            <div><Label>Attitude to Work</Label><Input value={card.attitude || ""} onChange={e => setCard({ ...card, attitude: e.target.value })} className="mt-1" /></div>
            <div className="sm:col-span-2"><Label>Position in Class</Label><Input value={card.position || ""} onChange={e => setCard({ ...card, position: e.target.value })} className="mt-1" /></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div><Label>Class Teacher's Remark</Label><Textarea rows={3} value={card.classTeacherRemark || ""} onChange={e => setCard({ ...card, classTeacherRemark: e.target.value })} className="mt-1" /></div>
            <div><Label>Headteacher's Remark</Label><Textarea rows={3} value={card.headteacherRemark || ""} onChange={e => setCard({ ...card, headteacherRemark: e.target.value })} className="mt-1" /></div>
          </div>
        </CardContent>
      </Card>

      <div className="print-area mx-auto bg-white text-black shadow-md border border-border" style={{ width: "210mm", minHeight: "297mm", padding: "14mm" }}>
        <div className="flex items-start justify-between border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            {schoolInfo.logoUrl ? (
              <img src={schoolInfo.logoUrl} alt={schoolInfo.name} className="h-16 w-16 object-contain rounded" />
            ) : (
              <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#062f26" }}>
                <GraduationCap className="h-9 w-9" style={{ color: "#d7c7a3" }} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-extrabold uppercase tracking-tight" style={{ color: "#062f26" }}>{schoolInfo.name}</h1>
              <p className="text-xs italic">{schoolInfo.motto}</p>
              <p className="text-xs">{schoolInfo.address}</p>
              <p className="text-xs">Tel: {schoolInfo.phone} • {schoolInfo.email}</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold uppercase tracking-wider" style={{ color: "#062f26" }}>Terminal Report</p>
            <p>{card.academicYear}</p><p>{card.term}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-4 text-sm">
          <InfoRow label="Student Name" value={`${student.firstName} ${student.lastName}`} />
          <InfoRow label="Admission No." value={student.admissionNumber} />
          <InfoRow label="Class" value={student.className || "—"} />
          <InfoRow label="Gender" value={student.gender || "—"} />
          <InfoRow label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-GB") : "—"} />
          <InfoRow label="Guardian" value={student.guardianName || "—"} />
          {card.position && <InfoRow label="Position" value={card.position} />}
          <InfoRow label="Date Generated" value={new Date().toLocaleDateString("en-GB")} />
        </div>

        <table className="w-full mt-5 text-sm border-collapse">
          <thead>
            <tr style={{ backgroundColor: "#062f26", color: "#d7c7a3" }}>
              <th className="text-left p-2">Subject</th>
              <th className="text-center p-2 w-16">Class<br/>(50)</th>
              <th className="text-center p-2 w-16">Exam<br/>(50)</th>
              <th className="text-center p-2 w-16">Total<br/>(100)</th>
              <th className="text-center p-2 w-14">Grade</th>
              <th className="text-left p-2">Remark</th>
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
          </tbody>
        </table>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
          <SummaryBox label="Total Score" value={`${aggregate} / ${card.subjects.length * 100}`} />
          <SummaryBox label="Average" value={`${average.toFixed(1)}%`} />
          <SummaryBox label="Overall Grade" value={overall.grade} />
          <SummaryBox label="Attendance" value={attendancePct !== null ? `${card.attendancePresent}/${card.attendanceTotal} (${attendancePct}%)` : "—"} />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="border p-2" style={{ borderColor: "#062f26" }}><span className="font-semibold">Conduct:</span> {card.conduct || "—"}</div>
          <div className="border p-2" style={{ borderColor: "#062f26" }}><span className="font-semibold">Attitude to Work:</span> {card.attitude || "—"}</div>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <RemarkBlock title="Class Teacher's Remark" body={card.classTeacherRemark} signLabel="Class Teacher" />
          <RemarkBlock title="Headteacher's Remark" body={card.headteacherRemark} signLabel="Headteacher" />
        </div>

        <div className="mt-5 text-[10px] border-t pt-2" style={{ borderColor: "#062f26" }}>
          <p className="font-semibold mb-1">Grading Key (WAEC Standard)</p>
          <p>A1: 80–100 Excellent • B2: 75–79 Very Good • B3: 70–74 Good • C4–C6: 55–69 Credit • D7–E8: 45–54 Pass • F9: Below 45 Fail</p>
          <p className="mt-2 italic">Generated by {schoolInfo.name} • {schoolInfo.website}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex gap-2"><span className="font-semibold min-w-[110px]">{label}:</span><span>{value}</span></div>;
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
    <div className="border p-2" style={{ borderColor: "#062f26" }}>
      <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: "#062f26" }}>{title}</p>
      <p className="mt-1 min-h-[2.5rem]">{body || "—"}</p>
      <div className="border-b border-black h-6 mt-3" />
      <p className="text-[10px] mt-1">{signLabel}'s Signature & Date</p>
    </div>
  );
}
