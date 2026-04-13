import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Edit } from "lucide-react";
import { teachers } from "@/lib/demo-data";

export default function TeachersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="dashboard-header">Teachers</h1>
          <p className="text-sm text-muted-foreground">{teachers.length} teachers</p>
        </div>
        <Button className="font-semibold"><Plus className="h-4 w-4 mr-2" />Add Teacher</Button>
      </div>
      <Card className="border-border">
        <CardContent className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell className="text-sm">{t.classes.join(", ")}</TableCell>
                  <TableCell className="text-sm">{t.qualification}</TableCell>
                  <TableCell className="text-sm">{t.phone}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
