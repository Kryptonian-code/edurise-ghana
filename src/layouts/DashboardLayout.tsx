import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, DollarSign,
  ClipboardList, Bell, BarChart3, Settings, LogOut, Menu, ChevronDown,
  UserCheck, FileText, Globe
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { schoolInfo } from "@/lib/demo-data";

const sidebarItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Students", path: "/admin/students", icon: Users },
  { label: "Teachers", path: "/admin/teachers", icon: GraduationCap },
  { label: "Academics", path: "/admin/academics", icon: BookOpen },
  { label: "Attendance", path: "/admin/attendance", icon: UserCheck },
  { label: "Results", path: "/admin/results", icon: ClipboardList },
  { label: "Fees & Billing", path: "/admin/fees", icon: DollarSign },
  { label: "Admissions", path: "/admin/admissions", icon: FileText },
  { label: "Announcements", path: "/admin/announcements", icon: Bell },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "CMS", path: "/admin/cms", icon: Globe },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-primary text-primary-foreground">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-accent shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{schoolInfo.name}</p>
              <p className="text-xs text-accent">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.path)
                ? "bg-sidebar-accent text-accent"
                : "text-primary-foreground/70 hover:bg-sidebar-accent/50 hover:text-primary-foreground"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 px-3 py-2 w-full text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Back to Website</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
        <div className="fixed top-0 left-0 h-screen" style={{ width: collapsed ? 64 : 256 }}>
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { if (window.innerWidth < 1024) setMobileOpen(true); else setCollapsed(!collapsed); }}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground hidden sm:block">
              {sidebarItems.find(i => isActive(i.path))?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
            </Button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">SA</div>
              <span className="text-sm font-medium hidden sm:block">Super Admin</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
