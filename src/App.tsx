import { useEffect, useState } from 'react';
import MedicalOpinions from './components/MedicalOpinions';
import ContactUs from './components/ContactUs';
import ProfileSettings from './components/ProfileSettings';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import LoginModal, { type AuthUser } from './components/LoginModal';

type MainTab = 'medical-opinions' | 'contact' | 'profile-settings';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const TOKEN_KEY = 'pw_access_token';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTab>('medical-opinions');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showPublicSupport, setShowPublicSupport] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Session expired');
        const data = await response.json();
        setUser(data.user as AuthUser);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    void verifySession();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // Best effort logout.
      }
    }

    localStorage.removeItem(TOKEN_KEY);
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('medical-opinions');
    setShowPublicSupport(false);
  };

  const handleLogin = (token: string, authUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(authUser);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-[#00263E]">
        Verifying session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
        <Header
          isAuthenticated={false}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onLogoutClick={() => {}}
          onLogoClick={() => setShowPublicSupport(false)}
          onSupportClick={() => setShowPublicSupport(true)}
        />
        {showPublicSupport ? (
          <div className="flex-1 bg-[#F8F9FA] py-12">
            <ContactUs />
          </div>
        ) : (
          <LandingPage />
        )}
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      <Header
        isAuthenticated={true}
        onLoginClick={() => {}}
        onLogoutClick={handleLogout}
        onLogoClick={() => setActiveTab('medical-opinions')}
        onSupportClick={() => setActiveTab('contact')}
        onProfileSettingsClick={() => setActiveTab('profile-settings')}
        userDisplayName={user?.username || 'Account'}
      >
        <nav className="hidden md:flex items-center space-x-8 h-20">
          <button
            onClick={() => setActiveTab('medical-opinions')}
            className={`h-full flex items-center text-sm font-bold tracking-wide border-b-4 transition-all ${
              activeTab === 'medical-opinions'
                ? 'border-[#00263E] text-[#00263E]'
                : 'border-transparent text-gray-500 hover:text-[#00263E] hover:border-gray-300'
            }`}
          >
            PROFESSIONAL MEDICAL OPINIONS
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`h-full flex items-center text-sm font-bold tracking-wide border-b-4 transition-all ${
              activeTab === 'contact'
                ? 'border-[#00263E] text-[#00263E]'
                : 'border-transparent text-gray-500 hover:text-[#00263E] hover:border-gray-300'
            }`}
          >
            CONTACT US
          </button>
        </nav>
      </Header>

      <div className="bg-[#F8F9FA] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {activeTab === 'medical-opinions' && (
            <>
              <h1 className="text-3xl md:text-4xl font-light text-[#00263E] mb-2">
                Professional <span className="font-bold">Medical Opinions</span>
              </h1>
              <p className="text-[#63666A] max-w-2xl text-lg">
                Access our suite of specialized medical-legal generation tools tailored for healthcare professionals.
              </p>
            </>
          )}
          {activeTab === 'contact' && (
            <>
              <h1 className="text-3xl md:text-4xl font-light text-[#00263E] mb-2">
                Contact <span className="font-bold">PointWise</span>
              </h1>
              <p className="text-[#63666A] max-w-2xl text-lg">
                We&apos;re here to support your medical-legal practice. Reach out to our team.
              </p>
            </>
          )}
          {activeTab === 'profile-settings' && (
            <>
              <h1 className="text-3xl md:text-4xl font-light text-[#00263E] mb-2">
                Account <span className="font-bold">Settings</span>
              </h1>
              <p className="text-[#63666A] max-w-2xl text-lg">
                Manage your profile information, password, and security preferences.
              </p>
            </>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {activeTab === 'medical-opinions' && <MedicalOpinions />}
        {activeTab === 'contact' && <ContactUs />}
        {activeTab === 'profile-settings' && <ProfileSettings />}
      </main>
    </div>
  );
}

export default App;
