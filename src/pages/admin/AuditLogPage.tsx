import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Loader2, ScrollText } from "lucide-react";

interface Event {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: any;
  created_at: string;
}

export default function AuditLogPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("audit_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      setEvents((data || []) as Event[]);
      setLoading(false);
    })();
  }, []);

  const filtered = events.filter(e =>
    !filter ||
    e.action.toLowerCase().includes(filter.toLowerCase()) ||
    e.entity.toLowerCase().includes(filter.toLowerCase()) ||
    (e.actor_id || "").includes(filter)
  );

  const actionColor = (a: string) => {
    if (a.includes("denied") || a.includes("revoke")) return "destructive";
    if (a.includes("login") || a.includes("grant")) return "default";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-header flex items-center gap-2"><ScrollText className="h-6 w-6" /> Audit Log</h1>
        <p className="text-sm text-muted-foreground">Recent logins, role checks, and admin access attempts.</p>
      </div>

      <Card><CardContent className="p-4 sm:p-6 space-y-4">
        <Input placeholder="Filter by action, entity, or actor id" value={filter} onChange={e => setFilter(e.target.value)} className="max-w-sm" />

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap text-xs">{new Date(e.created_at).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={actionColor(e.action) as any}>{e.action}</Badge></TableCell>
                    <TableCell className="text-sm">{e.entity}{e.entity_id ? ` · ${e.entity_id.slice(0, 8)}` : ""}</TableCell>
                    <TableCell className="text-xs font-mono">{e.actor_id ? e.actor_id.slice(0, 8) : "—"}</TableCell>
                    <TableCell className="text-xs max-w-md">
                      <pre className="whitespace-pre-wrap break-all text-muted-foreground">{e.metadata && Object.keys(e.metadata).length ? JSON.stringify(e.metadata) : ""}</pre>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No events.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}
