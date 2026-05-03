import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Copy, Check, Send, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Invitation {
  id: string;
  email: string;
  role: "admin" | "teacher";
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

function statusOf(i: Invitation): { label: string; tone: "default" | "secondary" | "destructive" | "outline" } {
  if (i.accepted_at) return { label: "Accepted", tone: "default" };
  if (i.revoked_at) return { label: "Revoked", tone: "destructive" };
  if (new Date(i.expires_at) < new Date()) return { label: "Expired", tone: "outline" };
  return { label: "Pending", tone: "secondary" };
}

export default function InvitationsPage() {
  const [list, setList] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "teacher">("teacher");
  const [issued, setIssued] = useState<{ email: string; role: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("staff_invitations")
      .select("id, email, role, expires_at, accepted_at, revoked_at, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setList((data as Invitation[] | null) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email address."); return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("invite-staff", {
      body: { email: trimmed, role, origin: window.location.origin },
    });
    setSubmitting(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || "Failed to create invitation");
      return;
    }
    setIssued({ email: trimmed, role, url: (data as any).invite_url });
    setEmail("");
    toast.success("Invitation created. Share the link with the invitee.");
    load();
  };

  const copyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
    toast.success("Link copied");
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this invitation? The link will stop working.")) return;
    const { error } = await supabase.from("staff_invitations")
      .update({ revoked_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Invitation revoked");
    load();
  };

  const reissue = async (inv: Invitation) => {
    setRole(inv.role);
    setEmail(inv.email);
    toast.info("Form pre-filled. Click 'Send invitation' to issue a fresh link.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-header">Staff Invitations</h1>
        <p className="text-sm text-muted-foreground">Invite teachers and administrators by email. Each invitation creates a one-time link valid for 7 days.</p>
      </div>

      <Card className="border-border">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleInvite} className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
            <div>
              <Label htmlFor="inv-email">Email address</Label>
              <Input id="inv-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="teacher@school.edu.gh" className="mt-1" required />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "admin" | "teacher")}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={submitting} className="font-semibold">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-2" />Send invitation</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : list.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">No invitations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map(inv => {
                    const s = statusOf(inv);
                    const isPending = s.label === "Pending";
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.email}</TableCell>
                        <TableCell className="capitalize">{inv.role}</TableCell>
                        <TableCell><Badge variant={s.tone}>{s.label}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(inv.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </TableCell>
                        <TableCell className="text-right space-x-2 whitespace-nowrap">
                          {isPending && (
                            <Button variant="ghost" size="sm" onClick={() => revoke(inv.id)}>Revoke</Button>
                          )}
                          {(s.label === "Expired" || s.label === "Revoked") && (
                            <Button variant="ghost" size="sm" onClick={() => reissue(inv)}>
                              <RotateCcw className="h-3.5 w-3.5 mr-1" />Re-issue
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!issued} onOpenChange={(o) => !o && setIssued(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitation link ready</DialogTitle>
            <DialogDescription>
              Share this one-time link with <strong>{issued?.email}</strong>. They must sign in with this email to accept the {issued?.role} role. The link cannot be retrieved later.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-border bg-muted p-3 text-xs break-all font-mono">
            {issued?.url}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssued(null)}>Close</Button>
            <Button onClick={() => issued && copyLink(issued.url)}>
              {copied ? <><Check className="h-4 w-4 mr-2" />Copied</> : <><Copy className="h-4 w-4 mr-2" />Copy link</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
