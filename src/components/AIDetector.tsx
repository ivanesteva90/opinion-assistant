import { useState } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Download,
  Share2,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Contributor {
  text: string;
  score: number;
  impact: string;
}

interface AnalysisSentence {
  text: string;
  is_ai: boolean;
  confidence: number;
  label: string;
  ai_probability: number;
}

interface AnalysisSignals {
  burstiness?: number;
  ttr?: number;
  transition_density?: number;
  refinement_strength?: number;
}

interface AnalysisResult {
  score: number;
  label: string;
  category?: string;
  reasoning?: string;
  confidence?: number;
  sentences: AnalysisSentence[];
  contributors?: Contributor[];
  signals?: AnalysisSignals;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function AIDetector() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isContributorOpen, setIsContributorOpen] = useState(true);

  const handleDetect = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('pw_access_token') || ''}`,
        },
        body: JSON.stringify({
          text: inputText,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Detection failed');
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 min-h-[600px] bg-gray-50/50 p-4 rounded-xl">
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100">
          <span className="text-sm font-bold text-[#00263E] border-b-2 border-[#E87722] pb-3 -mb-3.5 z-10">
            English
          </span>
        </div>

        <div className="flex-1 relative group p-6">
          <textarea
            className="w-full h-full min-h-[500px] resize-none outline-none text-base leading-relaxed text-gray-700 placeholder-gray-300 font-serif"
            placeholder="Paste your text here to analyze..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          {error && (
            <div className="absolute top-4 left-6 right-6 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center">
            <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
              {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} Words
            </span>

            <button
              onClick={handleDetect}
              disabled={isAnalyzing || !inputText.trim()}
              className={`flex items-center space-x-2 px-6 py-2 rounded-full font-bold shadow-sm transition-all duration-200 text-sm ${
                isAnalyzing || !inputText.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#E87722] text-white hover:bg-[#D06015]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>Scan Text</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[420px] flex flex-col gap-4">
        <div className="flex justify-end items-center px-2">
          <div className="flex gap-3">
            <button className="flex items-center gap-1 text-xs font-bold text-[#E87722] hover:underline">
              <Share2 className="h-3 w-3" /> Share
            </button>
            <button className="flex items-center gap-1 text-xs font-bold text-[#E87722] hover:underline">
              <Download className="h-3 w-3" /> Download
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center relative">
          {!result && !isAnalyzing && (
            <div className="text-center py-12 opacity-50">
              <ShieldAlert className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Add text to see results</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full border-4 border-gray-100 border-t-[#E87722] animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium animate-pulse">Analyzing patterns...</p>
            </div>
          )}

          {result && (
            <>
              <div className="mt-4 mb-2 text-center">
                <span className="text-6xl font-extrabold text-[#00263E] block mb-1">{result.score}%</span>
                <span className="text-sm font-medium text-gray-500 flex items-center justify-center gap-1">
                  AI probability <Info className="h-3 w-3" />
                </span>
              </div>

              <div className="text-sm font-bold text-[#E87722] mb-4 text-center">
                {result.category || result.label}
              </div>

              <div className="w-full h-12 bg-gray-100 rounded-sm overflow-hidden mb-5">
                <div
                  className="h-full bg-[#FFB84D] transition-all duration-700 ease-out"
                  style={{ width: `${result.score}%` }}
                ></div>
              </div>

              <div className="w-full text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Confidence</span>
                  <span>{Math.round((result.confidence || 0) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Burstiness</span>
                  <span>{result.signals?.burstiness ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lexical Diversity (TTR)</span>
                  <span>{result.signals?.ttr ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Refinement Signal</span>
                  <span>{result.signals?.refinement_strength ?? '-'}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {result?.reasoning && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-bold text-[#00263E] mb-1">Why this result</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{result.reasoning}</p>
          </div>
        )}

        {result?.contributors && result.contributors.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setIsContributorOpen(!isContributorOpen)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">Top AI-Leaning Sentences</span>
                <Info className="h-3 w-3 text-gray-400" />
              </div>
              {isContributorOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {isContributorOpen && (
              <div className="p-4 bg-white space-y-3">
                {result.contributors.slice(0, 3).map((item, idx) => (
                  <div key={`${item.text}-${idx}`} className="bg-gray-50 border-l-4 border-[#FFB84D] p-3 rounded-r-md">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-gray-500 uppercase">{item.impact} impact</span>
                      <span className="text-xs font-bold text-[#FFB84D]">{item.score}%</span>
                    </div>
                    <p className="text-sm text-gray-800 italic leading-relaxed">"{item.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {result?.sentences && result.sentences.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-bold text-[#00263E] mb-3">Sentence Breakdown</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {result.sentences.slice(0, 8).map((s, idx) => (
                <div key={`${s.text}-${idx}`} className="text-xs border border-gray-100 rounded-md p-2">
                  <div className="flex justify-between mb-1">
                    <span className={s.is_ai ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                      {s.label}
                    </span>
                    <span className="text-gray-500">{s.ai_probability}%</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Info className="h-4 w-4 text-[#E87722]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#E87722] mb-1">Use this responsibly</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Detection is probabilistic. Combine this signal with document history and subject-matter review
                  before making decisions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
