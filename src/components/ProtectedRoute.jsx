import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAlumni = false, ignoreRole = false }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Admins always bypass all role/status checks
  if (currentUser.isAdmin) {
    return children;
  }

  // If the user has no role defined, they need to complete their profile setup first
  if (!ignoreRole && !currentUser.role) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Check if the user is explicitly set to pending
  if (!ignoreRole && currentUser.status === 'pending') {
    return <Navigate to="/pending" replace />;
  }

  // Block non-alumni (like students) from accessing alumni-only routes (like Directory)
  if (requireAlumni && currentUser.role !== 'alumni') {
    return <Navigate to="/" replace />;
  }

  return children;
}
