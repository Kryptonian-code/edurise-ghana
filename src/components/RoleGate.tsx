import { ReactNode } from "react";
import { useAuth, AppRole } from "@/contexts/AuthContext";

interface Props {
  roles: AppRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RoleGate({ roles, children, fallback = null }: Props) {
  const { roles: mine } = useAuth();
  const allowed = mine.some(r => roles.includes(r));
  return <>{allowed ? children : fallback}</>;
}
