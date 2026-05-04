import { useEffect, useMemo, useState } from "react";
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
import { Search, Plus, Eye, Edit, Trash2, Users, FileText, MoreVertical, FileDown, SlidersHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { listStudents, saveStudent, deleteStudent, listClasses, ensureClass, type StudentRow, type ClassRow } from "@/lib/students-store";
import { logAudit } from "@/lib/audit";

const CLASS_NAMES = ["Crèche", "Nursery 1", "Nursery 2", "KG 1", "KG 2", "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JHS 1", "JHS 2", "JHS 3", "SHS 1", "SHS 2", "SHS 3"];
type SortKey = "name" | "admission" | "class";

interface EditState {
  id?: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  className: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  status: string;
  admissionNumber: string;
}

export default function StudentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [guardianFilter, setGuardianFilter] = useState("");
  const [admissionFilter, setAdmissionFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [students, setStudents] = useState<StudentRow[] | null>(null);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState<StudentRow | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const reload = async () => {
    try {
      const [s, c] = await Promise.all([listStudents(), listClasses()]);
      setStudents(s);
      setClasses(c);
    } catch (e: any) { toast.error(e.message || "Failed to load students."); setStudents([]); }
  };

  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => {
    if (!students) return [];
    const q = search.trim().toLowerCase();
    const adm = admissionFilter.trim().toLowerCase();
    const grd = guardianFilter.trim().toLowerCase();
    let out = students.filter(s => {
      const cn = s.className || "";
      if (q && !`${s.firstName} ${s.lastName} ${s.admissionNumber} ${cn} ${s.guardianName || ""}`.toLowerCase().includes(q)) return false;
      if (classFilter !== "all" && cn !== classFilter) return false;
      if (adm && !s.admissionNumber.toLowerCase().includes(adm)) return false;
      if (grd && !(s.guardianName || "").toLowerCase().includes(grd)) return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sortKey === "name") return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      if (sortKey === "admission") return a.admissionNumber.localeCompare(b.admissionNumber);
      return (a.className || "").localeCompare(b.className || "");
    });
    return out;
  }, [students, search, classFilter, admissionFilter, guardianFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const activeFilterCount = (classFilter !== "all" ? 1 : 0) + (admissionFilter ? 1 : 0) + (guardianFilter ? 1 : 0);

  const generateAdmissionNumber = () => `PA-${new Date().getFullYear()}-${String((students?.length || 0) + 1).padStart(3, "0")}`;

  const openNew = () => {
    setEditState({
      firstName: "", lastName: "", gender: "Male", dateOfBirth: "", className: "",
      guardianName: "", guardianPhone: "", guardianEmail: "", status: "active",
      admissionNumber: generateAdmissionNumber(),
    });
    setDialogOpen(true);
  };

  const openEdit = (s: StudentRow) => {
    setEditState({
      id: s.id,
      firstName: s.firstName, lastName: s.lastName,
      gender: s.gender || "Male",
      dateOfBirth: s.dateOfBirth || "",
      className: s.className || "",
      guardianName: s.guardianName || "",
      guardianPhone: s.guardianPhone || "",
      guardianEmail: s.guardianEmail || "",
      status: s.status,
      admissionNumber: s.admissionNumber,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editState) return;
    if (!editState.firstName.trim() || !editState.lastName.trim()) return toast.error("Please fill in first and last name.");
    if (!editState.className) return toast.error("Please select a class.");
    if (!editState.guardianName.trim() || !editState.guardianPhone.trim()) return toast.error("Please fill in guardian name and phone.");
    setSaving(true);
    try {
      const cls = await ensureClass(editState.className);
      const saved = await saveStudent({
        id: editState.id,
        firstName: editState.firstName.trim(),
        lastName: editState.lastName.trim(),
        gender: editState.gender,
        dateOfBirth: editState.dateOfBirth || null,
        classId: cls.id,
        admissionNumber: editState.admissionNumber,
        guardianName: editState.guardianName.trim(),
        guardianPhone: editState.guardianPhone.trim(),
        guardianEmail: editState.guardianEmail.trim() || undefined,
        status: editState.status,
      });
      toast.success(editState.id ? "Student record updated." : "Student enrolled successfully.");
      logAudit(editState.id ? "student.update" : "student.create", "student", saved.id, { name: `${saved.firstName} ${saved.lastName}` });
      setDialogOpen(false);
      setEditState(null);
      reload();
    } catch (e: any) { toast.error(e.message || "Couldn't save student."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStudent(deleteTarget.id);
      toast.success(`${deleteTarget.firstName} ${deleteTarget.lastName} removed.`);
      logAudit("student.delete", "student", deleteTarget.id, { name: `${deleteTarget.firstName} ${deleteTarget.lastName}` });
      setDeleteTarget(null);
      reload();
    } catch (e: any) { toast.error(e.message || "Couldn't remove student."); }
  };

  const resetFilters = () => { setClassFilter("all"); setAdmissionFilter(""); setGuardianFilter(""); setSearch(""); setCurrentPage(1); };

  const ActionsMenu = ({ s }: { s: StudentRow }) => (
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
          <p className="text-sm text-muted-foreground">{students ? `${students.length} students enrolled` : "Loading..."}</p>
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
                  <SelectItem value="admission">Sort: Admission No.</SelectItem>
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
                    {CLASS_NAMES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Admission Number</Label><Input value={admissionFilter} onChange={e => { setAdmissionFilter(e.target.value); setCurrentPage(1); }} className="mt-1" placeholder="e.g. PA-2019" /></div>
              <div><Label className="text-xs">Guardian Name</Label><Input value={guardianFilter} onChange={e => { setGuardianFilter(e.target.value); setCurrentPage(1); }} className="mt-1" placeholder="e.g. Mensah" /></div>
              <div className="sm:col-span-3 flex justify-end"><Button variant="ghost" size="sm" onClick={resetFilters}>Reset filters</Button></div>
            </div>
          )}

          {students === null ? (
            <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-bold text-foreground mb-2">{search || activeFilterCount ? "No Results Found" : "No Students Enrolled Yet"}</h3>
              <p className="text-sm text-muted-foreground mb-4">{search || activeFilterCount ? "Try adjusting your search or filters." : "Click 'Add Student' to enrol your first student."}</p>
              {!search && !activeFilterCount && <Button onClick={openNew}>Add Student</Button>}
            </div>
          ) : (
            <>
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
                          <p className="text-xs text-muted-foreground font-mono truncate">{s.admissionNumber}</p>
                        </div>
                        <ActionsMenu s={s} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                        {s.className && <Badge variant="secondary">{s.className}</Badge>}
                        <Badge variant={s.status === "active" ? "default" : "secondary"} className="capitalize">{s.status}</Badge>
                      </div>
                      {s.guardianName && <p className="mt-2 text-xs text-muted-foreground truncate">Guardian: <span className="text-foreground">{s.guardianName}</span></p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto -mx-4 px-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="hidden lg:table-cell">Guardian</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.admissionNumber}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{s.firstName} {s.lastName}</TableCell>
                        <TableCell>{s.className || "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{s.guardianName || "—"}</TableCell>
                        <TableCell><Badge variant={s.status === "active" ? "default" : "secondary"} className="text-xs capitalize">{s.status}</Badge></TableCell>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editState?.id ? "Edit Student" : "Enrol New Student"}</DialogTitle>
            <DialogDescription>{editState?.id ? "Update the student's information below." : "Fill in the student's details to complete enrolment."}</DialogDescription>
          </DialogHeader>
          {editState && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>First Name *</Label><Input value={editState.firstName} onChange={e => setEditState({ ...editState, firstName: e.target.value })} className="mt-1" /></div>
              <div><Label>Last Name *</Label><Input value={editState.lastName} onChange={e => setEditState({ ...editState, lastName: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Date of Birth</Label><Input type="date" value={editState.dateOfBirth} onChange={e => setEditState({ ...editState, dateOfBirth: e.target.value })} className="mt-1" /></div>
              <div>
                <Label>Gender</Label>
                <Select value={editState.gender} onValueChange={v => setEditState({ ...editState, gender: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Class *</Label>
              <Select value={editState.className} onValueChange={v => setEditState({ ...editState, className: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{CLASS_NAMES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Guardian Name *</Label><Input value={editState.guardianName} onChange={e => setEditState({ ...editState, guardianName: e.target.value })} className="mt-1" /></div>
              <div><Label>Guardian Phone *</Label><Input value={editState.guardianPhone} onChange={e => setEditState({ ...editState, guardianPhone: e.target.value })} className="mt-1" placeholder="+233 XX XXX XXXX" /></div>
            </div>
            <div><Label>Guardian Email</Label><Input type="email" value={editState.guardianEmail} onChange={e => setEditState({ ...editState, guardianEmail: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={editState.status} onValueChange={v => setEditState({ ...editState, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Admission Number</Label>
                <Input value={editState.admissionNumber} onChange={e => setEditState({ ...editState, admissionNumber: e.target.value })} className="mt-1" />
              </div>
            </div>
          </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editState?.id ? "Save Changes" : "Enrol Student"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <p className="text-sm text-muted-foreground">{viewStudent.className || "—"} • {viewStudent.admissionNumber}</p>
                  <Badge variant={viewStudent.status === "active" ? "default" : "secondary"} className="text-xs mt-1 capitalize">{viewStudent.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Gender</p><p className="font-medium">{viewStudent.gender || "—"}</p></div>
                <div><p className="text-muted-foreground">Date of Birth</p><p className="font-medium">{viewStudent.dateOfBirth ? new Date(viewStudent.dateOfBirth).toLocaleDateString("en-GB") : "—"}</p></div>
                {viewStudent.enrolledOn && <div><p className="text-muted-foreground">Enrolled On</p><p className="font-medium">{new Date(viewStudent.enrolledOn).toLocaleDateString("en-GB")}</p></div>}
                <div className="col-span-2"><p className="text-muted-foreground">Guardian</p><p className="font-medium">{viewStudent.guardianName || "—"} • {viewStudent.guardianPhone || "—"}</p></div>
                {viewStudent.guardianEmail && <div className="col-span-2"><p className="text-muted-foreground">Guardian Email</p><p className="font-medium break-all">{viewStudent.guardianEmail}</p></div>}
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

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteTarget?.firstName} {deleteTarget?.lastName} ({deleteTarget?.admissionNumber}) from the system? This action cannot be undone.
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
