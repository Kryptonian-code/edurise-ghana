import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useRef } from "react";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, roles, loading, primaryPortalPath } = useAuth();
  const location = useLocation();
  const warned = useRef(false);

  const hasAccess = !allowedRoles?.length || roles.some(r => allowedRoles.includes(r));

  useEffect(() => {
    if (!loading && user && !hasAccess && !warned.current) {
      warned.current = true;
      toast.error("You don't have access to that area.");
    }
  }, [loading, user, hasAccess]);

  if (loading) {
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
