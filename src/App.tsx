import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AiChat } from './components/AiChat';

// Pages
import { BoshSahifa } from './pages/BoshSahifa';
import { KirishSahifasi } from './pages/KirishSahifasi';
import { BolimTanlash } from './pages/BolimTanlash';

import { KategoriyaBolimi } from './pages/KategoriyaBolimi';
import { DarsSahifasi } from './pages/DarsSahifasi';
import { AdminPanel } from './pages/admin/AdminPanel';
import { AdminKategoriyalar } from './pages/admin/AdminKategoriyalar';
import { AdminDarslar } from './pages/admin/AdminDarslar';
import { AdminFoydalanuvchilar } from './pages/admin/AdminFoydalanuvchilar';
import { AdminBolimlar } from './pages/admin/AdminBolimlar';

// Protected Route
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/kirish" replace />;
  }
  
  return <>{children}</>;
}

// Admin Route
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
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
  );
}

function AiChatWrapper() {
  const { user } = useAuth();
  // Faqat login qilgan foydalanuvchilarga ko'rsatish
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




