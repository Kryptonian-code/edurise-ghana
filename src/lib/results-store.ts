// Persistent scores keyed by class+term+year+subject -> studentId -> {classScore,examScore}
// classScore is out of 50 (CA) and examScore is out of 50 to align with WAEC-style report cards.

export interface SubjectScoreEntry {
  classScore: number; // 0-50
  examScore: number; // 0-50
}

export type ResultsBook = Record<string, Record<string, SubjectScoreEntry>>;
// outer key: `${year}__${term}__${klass}__${subject}`
// inner key: studentId

const KEY = "pa_results_book";

function readBook(): ResultsBook {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeBook(book: ResultsBook) {
  localStorage.setItem(KEY, JSON.stringify(book));
}

export function makeKey(year: string, term: string, klass: string, subject: string) {
  return `${year}__${term}__${klass}__${subject}`;
}

export function getSubjectScores(year: string, term: string, klass: string, subject: string): Record<string, SubjectScoreEntry> {
  const book = readBook();
  return book[makeKey(year, term, klass, subject)] || {};
}

export function saveSubjectScores(year: string, term: string, klass: string, subject: string, scores: Record<string, SubjectScoreEntry>) {
  const book = readBook();
  book[makeKey(year, term, klass, subject)] = scores;
  writeBook(book);
}

// Returns all subject scores for one student in one term across the class results book
export function getStudentTermScores(studentId: string, year: string, term: string, klass: string): Array<{ subject: string; classScore: number; examScore: number }> {
  const book = readBook();
  const prefix = `${year}__${term}__${klass}__`;
  const out: Array<{ subject: string; classScore: number; examScore: number }> = [];
  for (const k of Object.keys(book)) {
    if (!k.startsWith(prefix)) continue;
    const subject = k.slice(prefix.length);
    const entry = book[k][studentId];
    if (entry) out.push({ subject, classScore: entry.classScore || 0, examScore: entry.examScore || 0 });
  }
  return out;
}
