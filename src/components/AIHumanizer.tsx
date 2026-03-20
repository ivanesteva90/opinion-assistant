import { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Copy,
  CheckCircle2,
  RefreshCw,
  Type,
  Settings2,
} from 'lucide-react';

type HumanizeMode = 'precise' | 'balanced' | 'creative' | 'ghost';

interface HumanizeResponse {
  output: string;
  fidelity_ok: boolean;
  retries: number;
  input_chars: number;
  output_chars: number;
  violations: string[];
  boilerplate_hits: string[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const MODE_LABELS: Record<HumanizeMode, string> = {
  precise: 'Precision',
  balanced: 'Balanced',
  creative: 'Creative',
  ghost: 'Ghostwriter',
};

export default function AIHumanizer() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<HumanizeMode>('balanced');
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<HumanizeResponse | null>(null);

  const getStats = (text: string) => {
    const charCount = text.length;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    return { charCount, wordCount };
  };

  const handleHumanize = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setError(null);
    setOutputText('');
    setMeta(null);

    try {
      const response = await fetch(`${API_BASE}/api/humanize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('pw_access_token') || ''}`,
        },
        body: JSON.stringify({
          text: inputText,
          mode,
          length_ratio: 0.15,
          keep_sentence_count: true,
          keep_paragraph_count: true,
          max_retries: 2,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to humanize text');
      }

      const data: HumanizeResponse = await response.json();
      setOutputText(data.output);
      setMeta(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStats = getStats(inputText);
  const outputStats = getStats(outputText);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 min-h-[600px]">
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#00263E] flex items-center gap-2">
            <span className="bg-blue-100 p-2 rounded-lg">
              <RefreshCw className="h-5 w-5 text-[#00263E]" />
            </span>
            AI Text Input
          </h2>

          <span className="text-xs font-semibold text-[#63666A] bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Settings2 className="h-3 w-3" />
            Mode: {MODE_LABELS[mode]}
          </span>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {(Object.keys(MODE_LABELS) as HumanizeMode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                mode === option
                  ? 'bg-[#E87722] text-white border-[#E87722]'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-[#E87722] hover:text-[#E87722]'
              }`}
            >
              {MODE_LABELS[option]}
            </button>
          ))}
        </div>

        <div className="flex-1 relative group flex flex-col">
          <div className="relative flex-1">
            <textarea
              className="w-full h-full min-h-[500px] p-6 rounded-t-xl border border-gray-300 bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#E87722] focus:border-transparent transition-all shadow-sm resize-none text-base leading-relaxed pb-20"
              placeholder="Paste the draft you want to humanize here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            {error && (
              <div className="absolute bottom-20 left-6 right-6 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-100 shadow-sm z-20">
                Error: {error}
              </div>
            )}

            <div className="absolute bottom-6 right-6 z-10">
              <button
                onClick={handleHumanize}
                disabled={isProcessing || !inputText.trim()}
                className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-bold shadow-lg transition-all duration-200 uppercase tracking-wide text-sm
                  ${
                    isProcessing || !inputText.trim()
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#E87722] text-white hover:bg-[#D06015] hover:shadow-xl transform hover:-translate-y-1'
                  }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="animate-spin h-5 w-5" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Humanize Text</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 border-x border-b border-gray-300 rounded-b-xl px-6 py-3 flex items-center justify-between text-xs text-gray-500 font-medium">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Type className="h-3 w-3 mr-1" />
                {inputStats.wordCount} Words
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{inputStats.charCount} Characters</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#00263E] flex items-center gap-2">
            <span className="bg-orange-100 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-[#E87722]" />
            </span>
            Humanized Result
          </h2>
          {outputText && (
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1 text-xs font-bold text-[#00A9E0] hover:text-[#007C91] transition-colors uppercase tracking-wide bg-cyan-50 px-3 py-1 rounded-full"
            >
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          )}
        </div>

        <div className="flex-1 bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden min-h-[500px] flex flex-col relative">
          {!outputText && !isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50">
              <Sparkles className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-500">Ready to Transform</p>
              <p className="text-sm mt-2 max-w-xs">
                We preserve your meaning and improve natural flow with stronger stylistic fidelity.
              </p>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
              <div className="h-16 w-16 rounded-full border-4 border-gray-100 border-t-[#E87722] animate-spin mb-4"></div>
              <p className="text-[#00263E] font-medium animate-pulse">Analyzing & rewriting...</p>
              <p className="text-xs text-gray-400 mt-2">Mode: {MODE_LABELS[mode]}</p>
            </div>
          )}

          <textarea
            readOnly
            className="w-full flex-1 p-6 bg-[#FAFAFA] text-gray-800 resize-none outline-none font-serif text-lg leading-loose"
            value={outputText}
            placeholder=""
          />

          {(outputText || isProcessing) && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 text-xs text-gray-500 font-medium">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Type className="h-3 w-3 mr-1" />
                    {outputStats.wordCount} Words
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{outputStats.charCount} Characters</span>
                </div>
                {meta && (
                  <span className={meta.fidelity_ok ? 'text-emerald-600' : 'text-amber-600'}>
                    {meta.fidelity_ok ? 'Fidelity OK' : 'Review suggested'}
                  </span>
                )}
              </div>
              {meta && (meta.violations.length > 0 || meta.boilerplate_hits.length > 0) && (
                <div className="mt-2 text-[11px] text-amber-700">
                  Issues: {[...meta.violations, ...meta.boilerplate_hits].join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
