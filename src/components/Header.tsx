import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, LogOut } from 'lucide-react';
import Logo from './Logo';

interface HeaderProps {
  isAuthenticated: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onLogoClick: () => void;
  onSupportClick: () => void;
  onProfileSettingsClick?: () => void;
  userDisplayName?: string;
  children?: React.ReactNode;
}

export default function Header({ 
  isAuthenticated, 
  onLoginClick, 
  onLogoutClick, 
  onLogoClick, 
  onSupportClick,
  onProfileSettingsClick,
  userDisplayName,
  children 
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Side: Logo & Navigation */}
        <div className="flex items-center space-x-12">
          <Logo onClick={onLogoClick} className="h-12" /> {/* Adjusted height for smooth fit */}
          {children}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-6">
          <button 
            onClick={onSupportClick}
            className="text-[#00263E] font-semibold hover:underline hidden md:block"
          >
            Customer support
          </button>
          
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 bg-[#333333] text-white px-6 py-2 rounded-full font-bold hover:bg-black transition-colors"
              >
                <User className="h-4 w-4" />
                <span>My Account</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-sm font-bold text-[#00263E]">{userDisplayName || 'User'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onProfileSettingsClick?.();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#E87722]"
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogoutClick();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 bg-[#333333] text-white px-6 py-2 rounded-full font-bold hover:bg-black transition-colors"
              >
                <span>Sign in</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 z-50">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLoginClick();
                    }}
                    className="block w-full text-left px-6 py-3 text-[#00263E] hover:bg-gray-50 hover:text-[#E87722] font-medium border-b border-gray-100"
                  >
                    Sign In to Platform
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      // Handle create account
                    }}
                    className="block w-full text-left px-6 py-3 text-[#00263E] hover:bg-gray-50 hover:text-[#E87722] font-medium"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-[#E87722] to-[#FDBB30]"></div>
    </header>
  );
}
