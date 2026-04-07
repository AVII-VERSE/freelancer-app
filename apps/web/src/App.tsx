import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import Templates from './pages/Templates';
import AIAnalysis from './pages/AIAnalysis';
import Analytics from './pages/Analytics';
import Timezone from './pages/Timezone';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import ProjectSearch from './pages/ProjectSearch';
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
            background: '#25343F',
            color: '#EAEFEF',
            border: '1px solid rgba(191, 201, 209, 0.28)',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
        <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
        <Route path="/project-search" element={<PrivateRoute><ProjectSearch /></PrivateRoute>} />
        <Route path="/proposals" element={<PrivateRoute><Proposals /></PrivateRoute>} />
        <Route path="/templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
        <Route path="/ai" element={<PrivateRoute><AIAnalysis /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/timezone" element={<PrivateRoute><Timezone /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}