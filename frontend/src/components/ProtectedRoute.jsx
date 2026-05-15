import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Checking permissions…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 animate-in">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Admin Access Required</h2>
          <p className="text-slate-500 mb-8">You do not have permission to view this page.</p>
          <a href="/dashboard" className="btn-primary">Go to Dashboard</a>
        </div>
      </Layout>
    );
  }

  return <Layout>{children}</Layout>;
}
