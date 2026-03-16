import { useState } from 'react';
import { Lock, User, ArrowRight, CheckCircle2, Shield, Zap, Globe } from 'lucide-react';

interface LoginProps {
  onLogin: (success: boolean) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'ivanesteva' && password === 'ivanesteva') {
      onLogin(true);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      {/* Header - Optum Style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-3xl font-bold text-[#E87722]">Point</span>
            <span className="text-3xl font-light text-[#00263E]">Wise</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-[#00263E] hidden md:block">ALREADY A MEMBER?</span>
            <div className="h-8 w-8 bg-[#E87722] rounded-full flex items-center justify-center text-white">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#E87722] to-[#FDBB30]"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section with Split Layout */}
        <div className="relative bg-[#00263E] overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00263E] to-[#004B76] opacity-90"></div>
            {/* Abstract Background Pattern */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#E87722] opacity-10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#00A9E0] opacity-10 blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Value Proposition */}
            <div className="text-white space-y-8">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Professional Medical <br />
                <span className="text-[#FDBB30]">Opinion Platform</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-100 max-w-lg leading-relaxed">
                Access our suite of specialized medical-legal generation tools tailored for healthcare professionals. 
                Streamline your VA DBQ nexus letters, RBT analysis, and clinical reporting with AI precision.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#E87722] p-1 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-blue-50">VA Compliant Standards (Direct & CUE)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-[#E87722] p-1 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-blue-50">Secure & Private Clinical Environment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-[#E87722] p-1 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-blue-50">Multi-Specialty Report Generation</span>
                </div>
              </div>
            </div>

            {/* Right: Login Form Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 max-w-md w-full mx-auto lg:mx-0 lg:ml-auto transform transition-all hover:scale-[1.01]">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#00263E]">Welcome Back</h2>
                <p className="text-gray-500 text-sm mt-1">Please enter your credentials to access the suite.</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
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
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E87722] focus:border-transparent transition-all"
                      placeholder="Username"
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
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E87722] focus:border-transparent transition-all"
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

                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#E87722] hover:bg-[#D06015] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E87722] transition-colors uppercase tracking-wide"
                >
                  Sign In to Platform
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <a href="#" className="text-sm font-medium text-[#00263E] hover:text-[#E87722] transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Section */}
        <div className="bg-[#F8F9FA] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#00263E]">Enterprise-Grade Solutions</h2>
              <p className="mt-4 text-lg text-[#63666A]">Everything you need to produce high-quality medical-legal documentation.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6 text-[#E87722]" />
                </div>
                <h3 className="text-xl font-bold text-[#00263E] mb-3">Compliance First</h3>
                <p className="text-gray-600">Built-in logic ensures your nexus letters meet strict legal standards like CUE and Direct Service connection thresholds.</p>
              </div>
              
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-[#00263E]" />
                </div>
                <h3 className="text-xl font-bold text-[#00263E] mb-3">AI-Powered Speed</h3>
                <p className="text-gray-600">Draft complex medical opinions in seconds, not hours. Focus on your clinical judgment while we handle the formatting.</p>
              </div>
              
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-6">
                  <Globe className="h-6 w-6 text-[#00A9E0]" />
                </div>
                <h3 className="text-xl font-bold text-[#00263E] mb-3">Universal Access</h3>
                <p className="text-gray-600">Cloud-based platform accessible from any device. Secure, encrypted, and ready whenever you are.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-xl font-bold text-[#E87722]">Point</span>
            <span className="text-xl font-light text-[#00263E]">Wise</span>
            <span className="ml-4 text-sm text-gray-400">© 2026 All rights reserved.</span>
          </div>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-[#E87722]">Privacy Policy</a>
            <a href="#" className="hover:text-[#E87722]">Terms of Service</a>
            <a href="#" className="hover:text-[#E87722]">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
