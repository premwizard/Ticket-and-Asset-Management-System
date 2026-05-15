/**
 * src/App.jsx
 *
 * Root application component.
 * Defines client-side routes and enforces authentication via ProtectedRoute.
 * Uses React.lazy + Suspense for code-split page loading.
 *
 * Route map:
 *  /            → redirect to /dashboard or /login
 *  /login       → LoginPage  (public)
 *  /signup      → SignupPage (public)
 *  /dashboard   → DashboardPage (protected)
 *  /tickets     → TicketsPage   (protected)
 *  /assets      → AssetsPage    (protected)
 *  *            → NotFoundPage
 */

import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationToast from './components/NotificationToast';

// Eagerly load auth pages (needed immediately)
import LoginPage    from './pages/LoginPage';
import SignupPage   from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';

// Lazy load protected pages (only fetched when navigated to)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProjectsPage  = lazy(() => import('./pages/ProjectsPage'));
const TicketsPage   = lazy(() => import('./pages/TicketsPage'));
const TicketDetail  = lazy(() => import('./pages/TicketDetail'));
const AssetsPage    = lazy(() => import('./pages/AssetsPage'));
const ProfilePage   = lazy(() => import('./pages/ProfilePage'));

/** Lightweight fallback shown while lazy chunks load */
function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-medium text-slate-400">Loading page…</p>
      </div>
    </div>
  );
}

/**
 * App — root component with all route definitions.
 * The top-level loading guard prevents a flash of /login
 * before auth state is resolved from the backend.
 */
function App() {

  const { isAuthenticated, loading, authError } = useAuth();


  // Show full-screen loader while resolving session on app start
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Initializing…</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
            If this takes too long, check browser console (F12) for errors.
          </p>
        </div>
      </div>
    );
  }

  // Show auth error with option to retry or proceed to login
  if (authError && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Connection Issue</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{authError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
            <a
              href="/login"
              className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Root redirect */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />

          {/* Public routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />}
          />

          {/* Legacy auth route fallback — map any /auth/* path back to login */}
          <Route
            path="/auth/*"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />

          {/* Protected routes — lazy loaded */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/projects"
            element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>}
          />
          <Route
            path="/tickets"
            element={<ProtectedRoute><TicketsPage /></ProtectedRoute>}
          />
          <Route
            path="/tickets/:id"
            element={<ProtectedRoute><TicketDetail /></ProtectedRoute>}
          />
          <Route
            path="/assets"
            element={<ProtectedRoute><AssetsPage /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <NotificationToast />
    </>
  );
}

export default App;
