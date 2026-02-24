import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import Templates from './pages/Templates';
import AIAnalysis from './pages/AIAnalysis';
import Timezone from './pages/Timezone';
import { useAuthStore } from './store/auth.store';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/proposals" element={<PrivateRoute><Proposals /></PrivateRoute>} />
        <Route path="/templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
        <Route path="/ai" element={<PrivateRoute><AIAnalysis /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
       <Route path="/timezone" element={<PrivateRoute><Timezone /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}