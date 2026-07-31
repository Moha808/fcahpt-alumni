import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAlumni = false }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user is explicitly set to pending
  if (currentUser.status === 'pending') {
    return <Navigate to="/pending" replace />;
  }

  // Block students from accessing alumni-only routes (like Directory)
  if (requireAlumni && currentUser.role === 'student' && !currentUser.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
