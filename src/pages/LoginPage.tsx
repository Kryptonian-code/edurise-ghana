import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraduationCap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, roles, loading } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  // Redirect once authenticated
  useEffect(() => {
    if (loading || !user) return;
    const from = (location.state as any)?.from?.pathname as string | undefined;
    if (from) { navigate(from, { replace: true }); return; }
    if (roles.includes("admin")) navigate("/admin", { replace: true });
    else if (roles.includes("teacher")) navigate("/teacher", { replace: true });
    else navigate("/parent", { replace: true });
  }, [user, roles, loading, navigate, location.state]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: signinEmail.trim(),
      password: signinPassword,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials"
        ? "Incorrect email or password."
        : error.message);
      return;
    }
    toast.success("Welcome back!");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail.trim(),
      password: signupPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: signupName.trim() },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.includes("already registered")
        ? "An account with this email already exists. Please sign in."
        : error.message);
      return;
    }
    toast.success("Account created. Please check your email to confirm.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "var(--hero-gradient)" }}>
      <Card className="w-full max-w-md border-border shadow-xl">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap className="h-7 w-7 text-accent" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Prestige Academy</h1>
            <p className="text-sm text-muted-foreground">Sign in to your portal</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="si-email">Email Address</Label>
                  <Input id="si-email" type="email" required autoComplete="email"
                    value={signinEmail} onChange={e => setSigninEmail(e.target.value)}
                    placeholder="you@example.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="si-pass">Password</Label>
                  <Input id="si-pass" type="password" required autoComplete="current-password"
                    value={signinPassword} onChange={e => setSigninPassword(e.target.value)}
                    placeholder="Enter password" className="mt-1" />
                </div>
                <Button type="submit" className="w-full font-bold" size="lg" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="su-name">Full Name</Label>
                  <Input id="su-name" required value={signupName}
                    onChange={e => setSignupName(e.target.value)}
                    placeholder="Ama Mensah" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="su-email">Email Address</Label>
                  <Input id="su-email" type="email" required autoComplete="email"
                    value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                    placeholder="you@example.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="su-pass">Password</Label>
                  <Input id="su-pass" type="password" required minLength={8} autoComplete="new-password"
                    value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                    placeholder="At least 8 characters" className="mt-1" />
                </div>
                <Button type="submit" className="w-full font-bold" size="lg" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  New accounts default to the Parent Portal. School staff are upgraded by an administrator.
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to School Website
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
