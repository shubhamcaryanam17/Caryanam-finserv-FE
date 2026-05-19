import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  // ⏳ Loading state
  if (user === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Checking authentication...</p>
      </div>
    );
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ✅ Normalize roles
  const userRole = user.role?.toLowerCase();

  let requiredRole = role?.toLowerCase();

  // 🔥 Role Mapping (Frontend → Backend)
  const roleMap = {
    bank: "bank_evaluate",
    admin: "admin",
    user: "user",
  };

  requiredRole = roleMap[requiredRole] || requiredRole;

  // ❌ Role mismatch
  if (requiredRole && userRole !== requiredRole) {
    console.warn("Access Denied:", userRole, "!=", requiredRole);
    return <Navigate to="/" replace />;
  }

  // ✅ Access granted
  return children;
}