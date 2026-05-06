import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useRef } from "react";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";

interface Props {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, roles, loading, rolesLoading, primaryPortalPath } = useAuth();
  const location = useLocation();
  const warned = useRef(false);
  const logged = useRef<string | null>(null);

  const hasAccess = !allowedRoles?.length || roles.some(r => allowedRoles.includes(r));

  useEffect(() => {
    if (loading || rolesLoading || !user) return;
    const key = `${location.pathname}:${hasAccess}`;
    if (logged.current === key) return;
    logged.current = key;
    logAudit(
      hasAccess ? "access.granted" : "access.denied",
      "route",
      undefined,
      { path: location.pathname, allowedRoles, userRoles: roles }
    );
    if (!hasAccess && !warned.current) {
      warned.current = true;
      toast.error("You don't have access to that area.");
    }
  }, [loading, rolesLoading, user, hasAccess, location.pathname, allowedRoles, roles]);

  if (loading || (user && rolesLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    return <Navigate to={primaryPortalPath} replace />;
  }

  return <>{children}</>;
}
