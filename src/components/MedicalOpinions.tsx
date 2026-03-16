import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import VADBQGenerator from './VADBQGenerator';
import RBTGenerator from './RBTGenerator';
import GeneralGenerator from './GeneralGenerator';
import PersonalizedNotes from './PersonalizedNotes';
import AIHumanizer from './AIHumanizer';
import AIDetector from './AIDetector';

type SubTab = 'dbq' | 'rbt' | 'general' | 'notes' | 'humanizer' | 'detector';

export default function MedicalOpinions() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('dbq');
  const [isAiDropdownOpen, setIsAiDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAiDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isAiActive = activeSubTab === 'humanizer' || activeSubTab === 'detector';

  return (
    <div className="w-full">
      {/* Sub-navigation for Medical Opinions - Optum Style */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          
          {/* Standard Medical Tools */}
          <button
            onClick={() => setActiveSubTab('dbq')}
            className={`whitespace-nowrap pb-4 px-1 border-b-4 font-bold text-sm transition-all ${
              activeSubTab === 'dbq'
                ? 'border-[#E87722] text-[#00263E]'
                : 'border-transparent text-gray-500 hover:text-[#00263E] hover:border-gray-300'
            }`}
          >
            VA DBQ-Style Nexus
          </button>
          
          <button
            onClick={() => setActiveSubTab('rbt')}
            className={`whitespace-nowrap pb-4 px-1 border-b-4 font-bold text-sm transition-all ${
              activeSubTab === 'rbt'
                ? 'border-[#E87722] text-[#00263E]'
                : 'border-transparent text-gray-500 hover:text-[#00263E] hover:border-gray-300'
            }`}
          >
            Rational Behavior Therapy
          </button>
          
          <button
            onClick={() => setActiveSubTab('general')}
            className={`whitespace-nowrap pb-4 px-1 border-b-4 font-bold text-sm transition-all ${
              activeSubTab === 'general'
                ? 'border-[#E87722] text-[#00263E]'
                : 'border-transparent text-gray-500 hover:text-[#00263E] hover:border-gray-300'
            }`}
          >
            General Reports
          </button>
          
          <button
            onClick={() => setActiveSubTab('notes')}
            className={`whitespace-nowrap pb-4 px-1 border-b-4 font-bold text-sm transition-all ${
              activeSubTab === 'notes'
                ? 'border-[#E87722] text-[#00263E]'
                : 'border-transparent text-gray-500 hover:text-[#00263E] hover:border-gray-300'
            }`}
          >
            Personalized Notes
          </button>

          {/* AI Tools Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsAiDropdownOpen(!isAiDropdownOpen)}
              className={`flex items-center whitespace-nowrap pb-4 px-1 border-b-4 font-bold text-sm transition-all outline-none ${
                isAiActive
                  ? 'border-[#E87722] text-[#00263E]'
                  : 'border-transparent text-gray-500 hover:text-[#00263E] hover:border-gray-300'
              }`}
            >
              <Sparkles className={`h-4 w-4 mr-2 ${isAiActive ? 'text-[#E87722]' : 'text-gray-400'}`} />
              AI Tools
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isAiDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isAiDropdownOpen && (
              <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-100">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={() => {
                      setActiveSubTab('humanizer');
                      setIsAiDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                      activeSubTab === 'humanizer' ? 'bg-orange-50 text-[#E87722] font-bold' : 'text-gray-700'
                    }`}
                    role="menuitem"
                  >
                    AI Humanizer
                  </button>
                  <button
                    onClick={() => {
                      setActiveSubTab('detector');
                      setIsAiDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                      activeSubTab === 'detector' ? 'bg-orange-50 text-[#E87722] font-bold' : 'text-gray-700'
                    }`}
                    role="menuitem"
                  >
                    AI Detector
                  </button>
                </div>
              </div>
            )}
          </div>

        </nav>
      </div>

      {/* Content Area */}
      <div className="mt-6 animate-in fade-in duration-300">
        {activeSubTab === 'dbq' && <VADBQGenerator />}
        {activeSubTab === 'rbt' && <RBTGenerator />}
        {activeSubTab === 'general' && <GeneralGenerator />}
        {activeSubTab === 'notes' && <PersonalizedNotes />}
        {activeSubTab === 'humanizer' && <AIHumanizer />}
        {activeSubTab === 'detector' && <AIDetector />}
      </div>
    </div>
  );
}
