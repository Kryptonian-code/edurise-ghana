import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Admissions", path: "/admissions" },
  { label: "Programmes", path: "/programmes" },
  { label: "Staff", path: "/staff" },
  { label: "Gallery", path: "/gallery" },
  { label: "News", path: "/news" },
  { label: "Events", path: "/events" },
  { label: "FAQ", path: "/faq" },
  { label: "Contact", path: "/contact" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="container-wide mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-accent" />
          <div>
            <span className="text-lg font-bold tracking-tight">Prestige Academy</span>
            <span className="hidden sm:block text-xs text-accent font-medium">Excellence Through Knowledge</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "bg-sidebar-accent text-accent"
                  : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/admissions">
            <Button variant="secondary" size="sm" className="font-semibold">
              Apply Now
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-semibold">
              Portal Login
            </Button>
          </Link>
        </div>

        <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-primary border-t border-sidebar-border">
          <nav className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`px-3 py-3 text-sm font-medium border-b border-sidebar-border/30 ${
                  location.pathname === link.path ? "text-accent" : "text-primary-foreground/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 py-4">
              <Link to="/admissions" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full font-semibold">Apply Now</Button>
              </Link>
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full border-accent text-accent font-semibold">Portal Login</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
