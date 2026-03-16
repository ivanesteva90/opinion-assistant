import { useState } from 'react';
import { ShieldAlert, ArrowRight, RefreshCw, AlertTriangle, Download, Share2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Contributor {
  text: string;
  score: number;
  impact: string;
}

interface AnalysisResult {
  score: number;
  label: string;
  sentences: {
    text: string;
    is_ai: boolean;
    confidence: number;
  }[];
  contributors?: Contributor[];
}

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
      const response = await fetch('http://localhost:8000/api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText
        }),
      });

      if (!response.ok) {
        throw new Error('Detection failed');
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      console.error(err);
      setError('Failed to analyze text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return '#10B981'; // Green (Human)
    if (score < 70) return '#F59E0B'; // Orange (Mixed)
    return '#F59E0B'; // Orange for AI as per screenshot
  };

  const data = result ? [
    { name: 'AI Probability', value: result.score, color: '#FFB84D' }, // Orange
    { name: 'Human Probability', value: 100 - result.score, color: '#F3F4F6' } // Light Gray
  ] : [];

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 min-h-[600px] bg-gray-50/50 p-4 rounded-xl">
      {/* Input Section */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Tabs */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100">
           <span className="text-sm font-bold text-[#00263E] border-b-2 border-[#E87722] pb-3 -mb-3.5 z-10">English</span>
        </div>
        
        <div className="flex-1 relative group p-6">
          <textarea
            className="w-full h-full min-h-[500px] resize-none outline-none text-base leading-relaxed text-gray-700 placeholder-gray-300 font-serif"
            placeholder="Paste your text here to analyze..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          
          {/* Bottom Toolbar */}
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center">
            <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
              {inputText.trim().split(/\s+/).filter(w => w).length} Words
            </span>
            <div className="flex gap-2">
               {/* Icons placeholder */}
            </div>
            
            <button
              onClick={handleDetect}
              disabled={isAnalyzing || !inputText.trim()}
              className={`flex items-center space-x-2 px-6 py-2 rounded-full font-bold shadow-sm transition-all duration-200 text-sm
                ${isAnalyzing || !inputText.trim() 
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

      {/* Result Section */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4">
        
        {/* Top Actions */}
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

        {/* Score Card */}
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
               <div className="mt-8 mb-2 text-center">
                  <span className="text-6xl font-extrabold text-[#00263E] block mb-1">
                    {result.score}%
                  </span>
                  <span className="text-sm font-medium text-gray-500 flex items-center justify-center gap-1">
                    of text is likely AI <Info className="h-3 w-3" />
                  </span>
               </div>
               
               {/* Brand Logo Placeholder */}
               <div className="flex items-center justify-center gap-1 mb-6 opacity-80">
                  <ShieldAlert className="h-4 w-4 text-[#E87722]" />
                  <span className="text-xs font-bold text-[#E87722]">PointWise</span>
               </div>

               {/* Chart */}
               <div className="w-full h-16 relative mb-6">
                 <div className="absolute inset-0 flex items-end justify-center px-8">
                    <div className="w-full h-12 bg-gray-100 rounded-sm overflow-hidden flex">
                       <div 
                         className="h-full bg-[#FFB84D] transition-all duration-1000 ease-out"
                         style={{ width: `${result.score}%` }}
                       ></div>
                    </div>
                 </div>
               </div>
               
               {/* Legend */}
               <div className="w-full space-y-3 px-4">
                  <div className="flex justify-between items-center text-sm">
                     <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#FFB84D]"></span>
                        <span className="text-gray-600">AI-generated</span>
                        <Info className="h-3 w-3 text-gray-300" />
                     </div>
                     <span className="font-bold text-gray-800">{result.score}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-100"></span>
                        <span className="text-gray-600">Human-written & AI-refined</span>
                        <Info className="h-3 w-3 text-gray-300" />
                     </div>
                     <span className="font-bold text-gray-800">0%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-white border border-gray-200"></span>
                        <span className="text-gray-600">Human-written</span>
                        <Info className="h-3 w-3 text-gray-300" />
                     </div>
                     <span className="font-bold text-gray-800">{100 - result.score}%</span>
                  </div>
               </div>
            </>
          )}
        </div>

        {/* Main AI Contributors Section */}
        {result && result.contributors && result.contributors.length > 0 && (
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button 
                onClick={() => setIsContributorOpen(!isContributorOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
              >
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700">Main AI Contributors</span>
                    <Info className="h-3 w-3 text-gray-400" />
                 </div>
                 {isContributorOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
              </button>
              
              {isContributorOpen && (
                 <div className="p-4 bg-white">
                    <div className="bg-gray-50 border-l-4 border-[#FFB84D] p-3 rounded-r-md">
                       <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-gray-500 uppercase">Top Suspect</span>
                          <span className="text-xs font-bold text-[#FFB84D]">High Confidence</span>
                       </div>
                       <p className="text-sm text-gray-800 italic leading-relaxed">
                          "{result.contributors[0].text}"
                       </p>
                    </div>
                    {result.contributors.length > 1 && (
                       <div className="mt-3 text-xs text-center text-gray-400">
                          + {result.contributors.length - 1} other suspicious sentences found
                       </div>
                    )}
                 </div>
              )}
           </div>
        )}

        {result && (
           <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-start gap-3">
                 <div className="mt-1">
                    <Info className="h-4 w-4 text-[#E87722]" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-[#E87722] mb-1">Understanding your results</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                       Our AI detector flags text that may be AI-generated. Use your best judgment when reviewing results. Never rely on AI detection alone to make decisions.
                    </p>
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
