import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AiChat } from './components/AiChat';

// Lazy loaded pages
const BoshSahifa = lazy(() => import('./pages/BoshSahifa').then(m => ({ default: m.BoshSahifa })));
const KirishSahifasi = lazy(() => import('./pages/KirishSahifasi').then(m => ({ default: m.KirishSahifasi })));
const BolimTanlash = lazy(() => import('./pages/BolimTanlash').then(m => ({ default: m.BolimTanlash })));
const KategoriyaBolimi = lazy(() => import('./pages/KategoriyaBolimi').then(m => ({ default: m.KategoriyaBolimi })));
const DarsSahifasi = lazy(() => import('./pages/DarsSahifasi').then(m => ({ default: m.DarsSahifasi })));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));
const AdminKategoriyalar = lazy(() => import('./pages/admin/AdminKategoriyalar').then(m => ({ default: m.AdminKategoriyalar })));
const AdminDarslar = lazy(() => import('./pages/admin/AdminDarslar').then(m => ({ default: m.AdminDarslar })));
const AdminFoydalanuvchilar = lazy(() => import('./pages/admin/AdminFoydalanuvchilar').then(m => ({ default: m.AdminFoydalanuvchilar })));
const AdminBolimlar = lazy(() => import('./pages/admin/AdminBolimlar').then(m => ({ default: m.AdminBolimlar })));

// Loading spinner
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );
}

// Protected Route
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/kirish" replace />;
  return <>{children}</>;
}

// Admin Route
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <PageLoader />;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={user ? <Navigate to="/bolim" /> : <BoshSahifa />} />
        <Route path="/kirish" element={user ? <Navigate to="/bolim" /> : <KirishSahifasi />} />
        
        {/* Protected */}
        <Route path="/bolim" element={<ProtectedRoute><BolimTanlash /></ProtectedRoute>} />
        <Route path="/kategoriya/:id" element={<ProtectedRoute><KategoriyaBolimi /></ProtectedRoute>} />
        <Route path="/dars/:id" element={<ProtectedRoute><DarsSahifasi /></ProtectedRoute>} />
        
        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin/bolimlar" element={<AdminRoute><AdminBolimlar /></AdminRoute>} />
        <Route path="/admin/kategoriyalar" element={<AdminRoute><AdminKategoriyalar /></AdminRoute>} />
        <Route path="/admin/darslar" element={<AdminRoute><AdminDarslar /></AdminRoute>} />
        <Route path="/admin/darslar/:categoryId" element={<AdminRoute><AdminDarslar /></AdminRoute>} />
        <Route path="/admin/foydalanuvchilar" element={<AdminRoute><AdminFoydalanuvchilar /></AdminRoute>} />
      </Routes>
    </Suspense>
  );
}

function AiChatWrapper() {
  const { user } = useAuth();
  if (!user) return null;
  return <AiChat />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <AiChatWrapper />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
