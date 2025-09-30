// components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

type ProtectedRouteProps = {
  requiredRole?: "Admin" | "OBGYN" | "Secretary";
};

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/" replace />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ renders either nested routes (Outlet) or children
  return <Outlet />;
}
