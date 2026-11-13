import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Loader } from '../components/common/Loader';

export function AuthLayout() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
}
