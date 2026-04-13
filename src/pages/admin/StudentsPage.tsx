import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Eye, Edit, UserPlus } from "lucide-react";
import { students } from "@/lib/demo-data";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const filtered = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.studentId} ${s.class}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-header">Student Management</h1>
          <p className="text-sm text-muted-foreground">{students.length} students enrolled</p>
        </div>
        <Button className="font-semibold"><Plus className="h-4 w-4 mr-2" />Add Student</Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, ID, or class..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Fee Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.studentId}</TableCell>
                    <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                    <TableCell>{s.class} {s.stream && `(${s.stream})`}</TableCell>
                    <TableCell>{s.gender}</TableCell>
                    <TableCell className="text-sm">{s.guardian}</TableCell>
                    <TableCell>
                      {s.feeBalance > 0 ? (
                        <span className="text-destructive font-semibold">₵{s.feeBalance.toLocaleString()}</span>
                      ) : (
                        <span className="text-success font-semibold">Cleared</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "Active" ? "default" : "secondary"} className="text-xs">{s.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
