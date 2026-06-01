import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import BoardsPage from './pages/BoardsPage';
import DeadlinePage from './pages/DeadlinePage';
import MatrixPage from './pages/MatrixPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AppShell from './components/layout/AppShell';
import ToastHost from './components/common/ToastHost';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { token, isReady } = useAuthStore();
  if (!isReady) return null;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Navigate to="/boards" replace />} />
          <Route path="/boards" element={<BoardsPage />} />
          <Route path="/deadline" element={<DeadlinePage />} />
          <Route path="/tasks" element={<MatrixPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastHost />
    </>
  );
}
