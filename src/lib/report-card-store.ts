// Storage and helpers for report card data per student/term

export interface SubjectScore {
  subject: string;
  classScore: number; // out of 50
  examScore: number; // out of 50
  remark?: string;
}

export interface ReportCard {
  studentId: string; // matches Student.id
  academicYear: string;
  term: string;
  subjects: SubjectScore[];
  attendancePresent?: number;
  attendanceTotal?: number;
  classTeacherRemark?: string;
  headteacherRemark?: string;
  conduct?: string;
  attitude?: string;
  position?: string;
}

const KEY = "pa_report_cards";

const DEFAULT_SUBJECTS_PRIMARY = [
  "English Language",
  "Mathematics",
  "Integrated Science",
  "Social Studies",
  "Religious & Moral Education",
  "Creative Arts",
  "Computing (ICT)",
  "Ghanaian Language",
  "French",
];

const DEFAULT_SUBJECTS_JHS = [
  "English Language",
  "Mathematics",
  "Integrated Science",
  "Social Studies",
  "Religious & Moral Education",
  "Career Technology",
  "Computing (ICT)",
  "Ghanaian Language",
  "French",
];

const DEFAULT_SUBJECTS_SHS = [
  "English Language",
  "Core Mathematics",
  "Integrated Science",
  "Social Studies",
  "Elective Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
];

export function defaultSubjectsForClass(klass: string): string[] {
  if (klass.startsWith("SHS")) return DEFAULT_SUBJECTS_SHS;
  if (klass.startsWith("JHS")) return DEFAULT_SUBJECTS_JHS;
  if (klass.startsWith("Primary")) return DEFAULT_SUBJECTS_PRIMARY;
  return ["English Language", "Mathematics", "Environmental Studies", "Creative Arts", "Religious & Moral Education"];
}

function readAll(): ReportCard[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(list: ReportCard[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getReportCard(studentId: string, year: string, term: string): ReportCard | null {
  return readAll().find(r => r.studentId === studentId && r.academicYear === year && r.term === term) || null;
}

export function saveReportCard(card: ReportCard) {
  const list = readAll();
  const idx = list.findIndex(r => r.studentId === card.studentId && r.academicYear === card.academicYear && r.term === card.term);
  if (idx >= 0) list[idx] = card; else list.push(card);
  writeAll(list);
}

export function gradeFor(total: number): { grade: string; remark: string } {
  if (total >= 80) return { grade: "A1", remark: "Excellent" };
  if (total >= 75) return { grade: "B2", remark: "Very Good" };
  if (total >= 70) return { grade: "B3", remark: "Good" };
  if (total >= 65) return { grade: "C4", remark: "Credit" };
  if (total >= 60) return { grade: "C5", remark: "Credit" };
  if (total >= 55) return { grade: "C6", remark: "Credit" };
  if (total >= 50) return { grade: "D7", remark: "Pass" };
  if (total >= 45) return { grade: "E8", remark: "Pass" };
  return { grade: "F9", remark: "Fail" };
}

export function buildDefaultReportCard(studentId: string, klass: string, year: string, term: string): ReportCard {
  const subjects = defaultSubjectsForClass(klass).map(subject => ({
    subject,
    classScore: 0,
    examScore: 0,
    remark: "",
  }));
  return {
    studentId,
    academicYear: year,
    term,
    subjects,
    attendancePresent: 0,
    attendanceTotal: 0,
    classTeacherRemark: "",
    headteacherRemark: "",
    conduct: "Good",
    attitude: "Good",
  };
}
