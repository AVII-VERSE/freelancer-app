import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Mail, Zap } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <div className="hidden w-1/2 flex-col justify-center border-r border-gray-800 bg-gray-900 p-16 lg:flex">
        <div className="mb-12 flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-3">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold">FreelanceApp</h1>
        </div>
        <h2 className="mb-6 text-4xl font-bold leading-tight text-white">
          Win more projects.
          <br />
          Bid smarter.
        </h2>
        <p className="mb-8 text-lg text-gray-400">
          AI-powered proposal builder and bidding intelligence for serious freelancers.
        </p>
        <div className="space-y-4">
          {['AI Project Analysis', 'Smart Proposal Generator', 'Timezone Alert System', 'Performance Analytics'].map((f) => (
            <div key={f} className="flex items-center gap-3 text-gray-300">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <div className="rounded-xl bg-blue-600 p-2">
              <Zap size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">FreelanceApp</h1>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-white">Welcome back</h2>
          <p className="mb-8 text-gray-400">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-11 pr-4 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-11 pr-4 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="********"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
