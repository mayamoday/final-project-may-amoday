import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login', { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-summer-sky to-vibrant-pink mx-auto mb-4 flex items-center justify-center text-white shadow-lg animate-pulse">
            <span className="material-symbols-outlined text-3xl">forest</span>
          </div>
          <p className="text-slate-500 font-bold text-sm">טוען...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return <>{children}</>;
}
