import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

const subjects = ["Mathematics", "English Language", "Integrated Science", "Social Studies", "ICT", "French"];
const gradeScale = (score: number) => {
  if (score >= 80) return { grade: "1", remark: "Excellent" };
  if (score >= 70) return { grade: "2", remark: "Very Good" };
  if (score >= 60) return { grade: "3", remark: "Good" };
  if (score >= 50) return { grade: "4", remark: "Credit" };
  if (score >= 40) return { grade: "5", remark: "Pass" };
  return { grade: "9", remark: "Fail" };
};

const demoStudents = [
  { id: "1", name: "Kwame Asante", classTest: 18, assignment: 12, exam: 55 },
  { id: "2", name: "Ama Mensah", classTest: 20, assignment: 15, exam: 62 },
  { id: "3", name: "Yaw Boateng", classTest: 15, assignment: 10, exam: 48 },
  { id: "4", name: "Abena Osei", classTest: 22, assignment: 14, exam: 58 },
  { id: "5", name: "Kofi Adjei", classTest: 19, assignment: 13, exam: 52 },
];

export default function ResultsPage() {
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [scores, setScores] = useState(demoStudents);

  const updateScore = (id: string, field: "classTest" | "assignment" | "exam", value: number) => {
    setScores(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-header">Results & Grading</h1>
          <p className="text-sm text-muted-foreground">Enter and manage student scores</p>
        </div>
        <Button className="font-semibold" onClick={() => toast.success("Scores saved successfully!")}>Save Scores</Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select defaultValue="JHS 2">
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["JHS 1", "JHS 2", "JHS 3"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border">
        <CardContent className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Class Test (30%)</TableHead>
                <TableHead className="text-center">Assignment (20%)</TableHead>
                <TableHead className="text-center">Exam (50%)</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.sort((a, b) => (b.classTest + b.assignment + b.exam) - (a.classTest + a.assignment + a.exam)).map((s, i) => {
                const total = s.classTest + s.assignment + s.exam;
                const { grade, remark } = gradeScale(total);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-center">
                      <Input type="number" value={s.classTest} onChange={e => updateScore(s.id, "classTest", +e.target.value)} className="w-16 text-center mx-auto" min={0} max={30} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Input type="number" value={s.assignment} onChange={e => updateScore(s.id, "assignment", +e.target.value)} className="w-16 text-center mx-auto" min={0} max={20} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Input type="number" value={s.exam} onChange={e => updateScore(s.id, "exam", +e.target.value)} className="w-16 text-center mx-auto" min={0} max={50} />
                    </TableCell>
                    <TableCell className="text-center font-bold">{total}</TableCell>
                    <TableCell className="text-center font-bold">{grade}</TableCell>
                    <TableCell className="text-center text-sm">{remark}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
