import { useState } from 'react';
import { Lock, User, ArrowRight, X, Shield, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (token: string, user: AuthUser) => void;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  plan: string;
  is_active: boolean;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = (await response.json()) as LoginResponse | { detail?: string };

      if (!response.ok || !('access_token' in data)) {
        throw new Error(('detail' in data && data.detail) || 'Invalid credentials');
      }

      onLogin(data.access_token, data.user);
      setUsername('');
      setPassword('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#00263E]">Sign In</h3>
              <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 transition-colors">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent"
                    placeholder="Username or email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                  <Shield className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              <div className="mt-5 sm:mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`inline-flex w-full justify-center rounded-md px-3 py-3 text-sm font-bold text-white shadow-sm uppercase tracking-wide items-center ${
                    isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E87722] hover:bg-[#D06015]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Access Platform
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Admin bootstrap user from backend env:
              <span className="ml-1 font-semibold text-[#00263E]">DEFAULT_ADMIN_USERNAME</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
