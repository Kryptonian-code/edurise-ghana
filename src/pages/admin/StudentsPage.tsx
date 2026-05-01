import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Plus, Eye, Edit, Trash2, Users, FileText, MoreVertical, FileDown, SlidersHorizontal } from "lucide-react";
import { students as demoStudents, Student } from "@/lib/demo-data";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CLASSES = ["Crèche", "Nursery 1", "Nursery 2", "KG 1", "KG 2", "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JHS 1", "JHS 2", "JHS 3", "SHS 1", "SHS 2", "SHS 3"];

type SortKey = "name" | "studentId" | "class";

export default function StudentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [guardianFilter, setGuardianFilter] = useState("");
  const [admissionFilter, setAdmissionFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("pa_students");
    return saved ? JSON.parse(saved) : demoStudents;
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Partial<Student> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const persist = (list: Student[]) => {
    setStudents(list);
    localStorage.setItem("pa_students", JSON.stringify(list));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const adm = admissionFilter.trim().toLowerCase();
    const grd = guardianFilter.trim().toLowerCase();
    let out = students.filter(s => {
      if (q && !`${s.firstName} ${s.lastName} ${s.studentId} ${s.class} ${s.guardian}`.toLowerCase().includes(q)) return false;
      if (classFilter !== "all" && s.class !== classFilter) return false;
      if (adm && !s.studentId.toLowerCase().includes(adm)) return false;
      if (grd && !s.guardian.toLowerCase().includes(grd)) return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sortKey === "name") return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      if (sortKey === "studentId") return a.studentId.localeCompare(b.studentId);
      return a.class.localeCompare(b.class);
    });
    return out;
  }, [students, search, classFilter, admissionFilter, guardianFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const activeFilterCount = (classFilter !== "all" ? 1 : 0) + (admissionFilter ? 1 : 0) + (guardianFilter ? 1 : 0);

  const openNew = () => {
    setEditStudent({
      firstName: "", lastName: "", gender: "Male", dateOfBirth: "", class: "", guardian: "", guardianPhone: "", status: "Active", feeBalance: 0,
      admissionDate: new Date().toISOString().split("T")[0],
      studentId: `PA-${new Date().getFullYear()}-${String(students.length + 1).padStart(3, "0")}`,
    });
    setDialogOpen(true);
  };

  const openEdit = (s: Student) => { setEditStudent({ ...s }); setDialogOpen(true); };

  const handleSave = () => {
    if (!editStudent?.firstName || !editStudent?.lastName) return toast.error("Please fill in the student's first and last name.");
    if (!editStudent.class) return toast.error("Please select a class for the student.");
    if (!editStudent.guardian || !editStudent.guardianPhone) return toast.error("Please fill in guardian name and phone number.");

    if (editStudent.id) {
      persist(students.map(s => s.id === editStudent.id ? { ...s, ...editStudent } as Student : s));
      toast.success("Student record updated successfully.");
    } else {
      const newStudent: Student = {
        ...(editStudent as Student),
        id: Date.now().toString(),
        studentId: editStudent.studentId || `PA-${new Date().getFullYear()}-${String(students.length + 1).padStart(3, "0")}`,
      };
      persist([newStudent, ...students]);
      toast.success("Student enrolled successfully.");
    }
    setDialogOpen(false);
    setEditStudent(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    persist(students.filter(s => s.id !== deleteTarget.id));
    toast.success(`${deleteTarget.firstName} ${deleteTarget.lastName} has been removed.`);
    setDeleteTarget(null);
  };

  const resetFilters = () => {
    setClassFilter("all"); setAdmissionFilter(""); setGuardianFilter(""); setSearch(""); setCurrentPage(1);
  };

  const ActionsMenu = ({ s }: { s: Student }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open actions"><MoreVertical className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover">
        <DropdownMenuItem onClick={() => setViewStudent(s)}><Eye className="h-4 w-4 mr-2" />View profile</DropdownMenuItem>
        <DropdownMenuItem onClick={() => openEdit(s)}><Edit className="h-4 w-4 mr-2" />Edit student</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/admin/students/${s.id}/report-card`)}><FileText className="h-4 w-4 mr-2" />Report card</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setDeleteTarget(s)} className="text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />Remove student
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="dashboard-header">Student Management</h1>
          <p className="text-sm text-muted-foreground">{students.length} students enrolled</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="font-semibold" onClick={() => navigate("/admin/students/bulk-report-cards")}>
            <FileDown className="h-4 w-4 mr-2" />Bulk Report Cards
          </Button>
          <Button className="font-semibold" onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Student</Button>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-4 space-y-4">
          {/* Search + filters toolbar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search name, ID, class or guardian..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Select value={sortKey} onValueChange={v => setSortKey(v as SortKey)}>
                <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort: Name (A–Z)</SelectItem>
                  <SelectItem value="studentId">Sort: Admission No.</SelectItem>
                  <SelectItem value="class">Sort: Class</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setFiltersOpen(o => !o)} className="shrink-0">
                <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && <Badge className="ml-2 h-5 px-1.5">{activeFilterCount}</Badge>}
              </Button>
            </div>
          </div>

          {filtersOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-muted/40 border border-border">
              <div>
                <Label className="text-xs">Class</Label>
                <Select value={classFilter} onValueChange={v => { setClassFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All classes</SelectItem>
                    {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Admission Number</Label>
                <Input placeholder="e.g. PA-2019" value={admissionFilter} onChange={e => { setAdmissionFilter(e.target.value); setCurrentPage(1); }} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Guardian Name</Label>
                <Input placeholder="e.g. Mensah" value={guardianFilter} onChange={e => { setGuardianFilter(e.target.value); setCurrentPage(1); }} className="mt-1" />
              </div>
              <div className="sm:col-span-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={resetFilters}>Reset filters</Button>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-bold text-foreground mb-2">{search || activeFilterCount ? "No Results Found" : "No Students Enrolled Yet"}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search || activeFilterCount ? "Try adjusting your search or filters." : "Click 'Add Student' to enrol your first student."}
              </p>
              {!search && !activeFilterCount && <Button onClick={openNew}>Add Student</Button>}
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {paginated.map((s) => (
                  <div key={s.id} className="rounded-lg border border-border p-3 flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/20 text-primary font-bold flex items-center justify-center shrink-0">
                      {s.firstName[0]}{s.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{s.firstName} {s.lastName}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate">{s.studentId}</p>
                        </div>
                        <ActionsMenu s={s} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                        <Badge variant="secondary">{s.class}{s.stream ? ` (${s.stream})` : ""}</Badge>
                        <Badge variant={s.status === "Active" ? "default" : "secondary"}>{s.status}</Badge>
                        {s.feeBalance > 0
                          ? <Badge variant="destructive">₵{s.feeBalance.toLocaleString()} owed</Badge>
                          : <Badge className="bg-success text-success-foreground hover:bg-success">Cleared</Badge>}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground truncate">Guardian: <span className="text-foreground">{s.guardian}</span></p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto -mx-4 px-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="hidden lg:table-cell">Guardian</TableHead>
                      <TableHead>Fee Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.studentId}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{s.firstName} {s.lastName}</TableCell>
                        <TableCell>{s.class}{s.stream ? ` (${s.stream})` : ""}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{s.guardian}</TableCell>
                        <TableCell>
                          {s.feeBalance > 0
                            ? <span className="text-destructive font-semibold">₵{s.feeBalance.toLocaleString()}</span>
                            : <span className="text-success font-semibold">Cleared</span>}
                        </TableCell>
                        <TableCell><Badge variant={s.status === "Active" ? "default" : "secondary"} className="text-xs">{s.status}</Badge></TableCell>
                        <TableCell className="text-right"><ActionsMenu s={s} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-border">
                  <p className="text-xs sm:text-sm text-muted-foreground">Showing {(safePage - 1) * perPage + 1}–{Math.min(safePage * perPage, filtered.length)} of {filtered.length}</p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editStudent?.id ? "Edit Student" : "Enrol New Student"}</DialogTitle>
            <DialogDescription>
              {editStudent?.id ? "Update the student's information below." : "Fill in the student's details to complete enrolment."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>First Name *</Label><Input value={editStudent?.firstName || ""} onChange={e => setEditStudent(prev => ({ ...prev!, firstName: e.target.value }))} className="mt-1" /></div>
              <div><Label>Last Name *</Label><Input value={editStudent?.lastName || ""} onChange={e => setEditStudent(prev => ({ ...prev!, lastName: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Date of Birth</Label><Input type="date" value={editStudent?.dateOfBirth || ""} onChange={e => setEditStudent(prev => ({ ...prev!, dateOfBirth: e.target.value }))} className="mt-1" /></div>
              <div>
                <Label>Gender</Label>
                <Select value={editStudent?.gender} onValueChange={v => setEditStudent(prev => ({ ...prev!, gender: v as "Male" | "Female" }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Class *</Label>
                <Select value={editStudent?.class || ""} onValueChange={v => setEditStudent(prev => ({ ...prev!, class: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{CLASSES.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stream</Label>
                <Select value={editStudent?.stream || ""} onValueChange={v => setEditStudent(prev => ({ ...prev!, stream: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Guardian Name *</Label><Input value={editStudent?.guardian || ""} onChange={e => setEditStudent(prev => ({ ...prev!, guardian: e.target.value }))} className="mt-1" /></div>
              <div><Label>Guardian Phone *</Label><Input value={editStudent?.guardianPhone || ""} onChange={e => setEditStudent(prev => ({ ...prev!, guardianPhone: e.target.value }))} className="mt-1" placeholder="+233 XX XXX XXXX" /></div>
            </div>
            <div>
              <Label>Admission Number</Label>
              <Input value={editStudent?.studentId || ""} readOnly className="mt-1 bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">Auto-generated and cannot be changed.</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editStudent?.id ? "Save Changes" : "Enrol Student"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
        <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Student Profile</DialogTitle></DialogHeader>
          {viewStudent && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-accent/20 flex items-center justify-center text-lg sm:text-xl font-bold text-primary shrink-0">
                  {viewStudent.firstName[0]}{viewStudent.lastName[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-foreground truncate">{viewStudent.firstName} {viewStudent.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{viewStudent.class}{viewStudent.stream ? ` (${viewStudent.stream})` : ""} • {viewStudent.studentId}</p>
                  <Badge variant={viewStudent.status === "Active" ? "default" : "secondary"} className="text-xs mt-1">{viewStudent.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Gender</p><p className="font-medium">{viewStudent.gender}</p></div>
                <div><p className="text-muted-foreground">Date of Birth</p><p className="font-medium">{viewStudent.dateOfBirth ? new Date(viewStudent.dateOfBirth).toLocaleDateString("en-GB") : "—"}</p></div>
                <div><p className="text-muted-foreground">Admission Date</p><p className="font-medium">{new Date(viewStudent.admissionDate).toLocaleDateString("en-GB")}</p></div>
                <div><p className="text-muted-foreground">Fee Balance</p><p className={`font-bold ${viewStudent.feeBalance > 0 ? "text-destructive" : "text-success"}`}>{viewStudent.feeBalance > 0 ? `₵${viewStudent.feeBalance.toLocaleString()}` : "Cleared"}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Guardian</p><p className="font-medium">{viewStudent.guardian} • {viewStudent.guardianPhone}</p></div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setViewStudent(null)}>Close</Button>
            <Button variant="outline" onClick={() => { if (viewStudent) navigate(`/admin/students/${viewStudent.id}/report-card`); }}>
              <FileText className="h-4 w-4 mr-2" />Report Card
            </Button>
            <Button onClick={() => { if (viewStudent) { openEdit(viewStudent); setViewStudent(null); } }}>Edit Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteTarget?.firstName} {deleteTarget?.lastName} ({deleteTarget?.studentId}) from the system? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove Student</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
