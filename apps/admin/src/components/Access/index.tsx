import { type ReactNode } from "react";
import { useHasPermission, type PermissionAuth } from "@/contexts/AccessContext";

interface AccessProps {
  auth?: PermissionAuth;
  fallback?: ReactNode;
  children: ReactNode;
}

const Access = ({ auth, fallback = null, children }: AccessProps) => {
  const canAccess = useHasPermission(auth);

  return canAccess ? children : fallback;
};

export default Access;
