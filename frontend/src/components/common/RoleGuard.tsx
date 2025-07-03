import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback,
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if ((!isAuthenticated || !user) && location.pathname !== '/auth/login') {
    return <Navigate to="/auth/login" replace />;
  }

  // Redirect to a waiting page if not verified, unless an administrator
  if (user.role !== 'administrator' && !user.verified) {
    return <Navigate to="/auth/waiting-for-verification" replace />;
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You don't have permission to access this page. Your role (
            {user.role}) is not authorized for this content.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};
