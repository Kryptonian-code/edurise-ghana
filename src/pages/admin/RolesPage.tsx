import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";

type AppRole = "admin" | "teacher" | "parent" | "student";
const ALL_ROLES: AppRole[] = ["admin", "teacher", "parent", "student"];

interface Row {
  user_id: string;
  full_name: string | null;
  roles: AppRole[];
}

export default function RolesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: ur }] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name").order("full_name"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const map = new Map<string, Row>();
    (profiles || []).forEach((p: any) => map.set(p.user_id, { user_id: p.user_id, full_name: p.full_name, roles: [] }));
    (ur || []).forEach((r: any) => {
      const ex = map.get(r.user_id) || { user_id: r.user_id, full_name: null, roles: [] };
      ex.roles.push(r.role);
      map.set(r.user_id, ex);
    });
    setRows(Array.from(map.values()));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addRole = async (user_id: string, role: AppRole) => {
    setBusy(user_id + role);
    const { error } = await supabase.from("user_roles").insert({ user_id, role });
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    await logAudit("role.grant", "user_roles", user_id, { role });
    toast.success(`Granted ${role}`);
    load();
  };

  const removeRole = async (user_id: string, role: AppRole) => {
    setBusy(user_id + role);
    const { error } = await supabase.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    await logAudit("role.revoke", "user_roles", user_id, { role });
    toast.success(`Revoked ${role}`);
    load();
  };

  const filtered = rows.filter(r =>
    !filter ||
    (r.full_name || "").toLowerCase().includes(filter.toLowerCase()) ||
    r.user_id.includes(filter)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-header flex items-center gap-2"><ShieldCheck className="h-6 w-6" /> Role Management</h1>
        <p className="text-sm text-muted-foreground">Grant or revoke roles for any user.</p>
      </div>

      <Card><CardContent className="p-4 sm:p-6 space-y-4">
        <Input placeholder="Search by name or user id" value={filter} onChange={e => setFilter(e.target.value)} className="max-w-sm" />

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Current Roles</TableHead>
                <TableHead>Grant Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.user_id}>
                  <TableCell>
                    <div className="font-medium">{r.full_name || "(no name)"}</div>
                    <div className="text-xs text-muted-foreground font-mono">{r.user_id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.roles.length === 0 && <span className="text-xs text-muted-foreground">none</span>}
                      {r.roles.map(role => (
                        <Badge key={role} variant="secondary" className="gap-1">
                          {role}
                          <button onClick={() => removeRole(r.user_id, role)} disabled={busy === r.user_id + role}
                            className="ml-0.5 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ALL_ROLES.filter(role => !r.roles.includes(role)).map(role => (
                        <Button key={role} size="sm" variant="outline"
                          disabled={busy === r.user_id + role}
                          onClick={() => addRole(r.user_id, role)}>
                          + {role}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No users found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>
    </div>
  );
}
