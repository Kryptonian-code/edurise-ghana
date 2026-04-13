import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("admin");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin") navigate("/admin");
    else if (role === "teacher") navigate("/teacher");
    else navigate("/parent");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--hero-gradient)" }}>
      <Card className="w-full max-w-md border-border shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-accent" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Prestige Academy</h1>
            <p className="text-sm text-muted-foreground">Sign in to your portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Portal</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin Dashboard</SelectItem>
                  <SelectItem value="teacher">Teacher Portal</SelectItem>
                  <SelectItem value="parent">Parent Portal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Email Address</Label>
              <Input type="email" placeholder="your@email.com" className="mt-1" defaultValue="admin@prestigeacademy.edu.gh" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" placeholder="Enter password" className="mt-1" defaultValue="password" />
            </div>
            <Button type="submit" className="w-full font-bold" size="lg">Sign In</Button>
          </form>

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
