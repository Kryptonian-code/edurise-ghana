import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, GraduationCap, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, portalPathFor } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AcceptInvitePage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const { user, loading, refreshRoles } = useAuth();

  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!token) { setState("error"); setMessage("This invitation link is missing its token."); return; }
    if (!user) return; // Wait for sign in

    let cancelled = false;
    (async () => {
      setState("working");
      const { data, error } = await supabase.rpc("accept_staff_invitation", { _token: token });
      if (cancelled) return;
      if (error) {
        setState("error");
        setMessage(error.message || "We couldn't accept this invitation.");
        return;
      }
      await refreshRoles();
      const grantedRole = String(data || "");
      setState("done");
      setMessage(`You now have ${grantedRole} access.`);
      toast.success("Invitation accepted");
      setTimeout(() => navigate(portalPathFor([grantedRole as any]), { replace: true }), 1500);
    })();
    return () => { cancelled = true; };
  }, [token, user, loading, navigate, refreshRoles]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "var(--hero-gradient)" }}>
      <Card className="w-full max-w-md border-border shadow-xl">
        <CardContent className="p-6 sm:p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-accent" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Accept Staff Invitation</h1>

          {loading && <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />}

          {!loading && !user && (
            <>
              <p className="text-sm text-muted-foreground">Please sign in (or create an account) using the email address this invitation was sent to.</p>
              <Link to={`/login?redirect=${encodeURIComponent(`/accept-invite?token=${token}`)}`}>
                <Button className="w-full font-semibold">Sign in to continue</Button>
              </Link>
            </>
          )}

          {state === "working" && (
            <>
              <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Verifying your invitation…</p>
            </>
          )}

          {state === "done" && (
            <>
              <CheckCircle2 className="h-10 w-10 mx-auto text-primary" />
              <p className="text-sm text-foreground">{message}</p>
              <p className="text-xs text-muted-foreground">Redirecting you now…</p>
            </>
          )}

          {state === "error" && (
            <>
              <AlertCircle className="h-10 w-10 mx-auto text-destructive" />
              <p className="text-sm text-foreground">{message}</p>
              <Link to="/"><Button variant="outline" className="w-full">Back to website</Button></Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
