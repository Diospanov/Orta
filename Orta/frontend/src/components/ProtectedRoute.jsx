import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ children }) {
  const { isChecking, isAuthenticated } = useAuth();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#18a999] text-white text-2xl">
        Checking authorization...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
