import { useState } from 'react';
import axios from 'axios';
import { 
  ClipboardCopy, 
  FileText, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Stethoscope 
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface ApiErrorDetail {
  detail?: string | { loc?: (string | number)[]; msg?: string }[] | Record<string, unknown>;
}

export default function VADBQGenerator() {
  const [inputData, setInputData] = useState('');
  const [opinion, setOpinion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setOpinion('');
    setCopied(false);
    
    try {
      // Try to parse as JSON if possible, otherwise send as string
      let payloadData = inputData;
      try {
        const parsed = JSON.parse(inputData);
        payloadData = parsed;
      } catch {
        // Not JSON, that's fine, send as string
      }

      const response = await axios.post(`${API_BASE}/generate`, {
        case_data: payloadData
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('pw_access_token') || ''}`
        }
      });

      setOpinion(response.data.opinion);
    } catch (err: unknown) {
      let errorMessage = 'An error occurred connecting to the server.';

      if (axios.isAxiosError<ApiErrorDetail>(err) && err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          // Pydantic validation errors are arrays of objects
          errorMessage = detail
            .map((e) => `${e.loc?.join('.') || 'Field'}: ${e.msg || 'Invalid value'}`)
            .join('\n');
        } else if (typeof detail === 'object') {
          errorMessage = JSON.stringify(detail);
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!opinion) return;
    navigator.clipboard.writeText(opinion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8">
      {/* Left Column: Input */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#00263E] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#E87722]" />
            Case Information
          </h2>
          <span className="text-xs font-semibold text-[#63666A] bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Text or JSON
          </span>
        </div>
        
        <div className="flex-1 relative group">
          <textarea
            className="w-full h-full min-h-[500px] p-6 rounded-md border border-gray-300 bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#E87722] focus:border-transparent transition-all shadow-sm resize-none font-mono text-sm leading-relaxed"
            placeholder={`Paste case details here...

Example:
"Veteran served 2010-2014. Parachutist badge. 
STRs show lumbar strain in 2012. 
Current MRI shows L4-L5 herniation. 
Is this condition service connected?"`}
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
          />
          
          {/* Action Bar inside Input */}
          <div className="absolute bottom-6 right-6">
            <button
              onClick={handleGenerate}
              disabled={loading || !inputData.trim()}
              className={`flex items-center space-x-2 px-8 py-3 rounded-md font-bold shadow-md transition-all duration-200 uppercase tracking-wide text-sm
                ${loading || !inputData.trim() 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#E87722] text-white hover:bg-[#D06015] hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Generate Opinion</span>
                  <Stethoscope className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Output */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#00263E] flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#00A9E0]" />
            Medical Opinion
          </h2>
          {opinion && (
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1 text-xs font-bold text-[#00A9E0] hover:text-[#007C91] transition-colors uppercase tracking-wide"
            >
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
              <span>{copied ? 'Copied' : 'Copy Result'}</span>
            </button>
          )}
        </div>

        <div className="flex-1 bg-white rounded-md border border-gray-300 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          {error && (
            <div className="bg-red-50 border-b border-red-100 p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-red-800">System Error</h3>
                <pre className="text-sm text-red-600 mt-1 whitespace-pre-wrap font-mono text-xs">{error}</pre>
              </div>
            </div>
          )}

          <div className="flex-1 p-8 overflow-y-auto bg-[#FAFAFA]">
            {!opinion && !loading && !error && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-6 opacity-60">
                <Activity className="h-16 w-16 text-gray-300" />
                <div className="text-center max-w-xs">
                  <p className="text-lg font-medium text-gray-500">Ready to Analyze</p>
                  <p className="text-sm mt-2">Enter clinical data on the left to generate a nexus opinion.</p>
                </div>
              </div>
            )}

            {loading && !opinion && (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-gray-200 border-t-[#E87722] animate-spin"></div>
                </div>
                <p className="text-[#00263E] font-medium animate-pulse">Analyzing clinical evidence...</p>
              </div>
            )}

            {opinion && (
              <div className="prose prose-slate max-w-none">
                <div className="font-serif text-lg leading-loose text-gray-800 whitespace-pre-wrap">
                  {opinion}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer of card */}
          <div className="bg-gray-50 p-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              Generated by PointWise AI. Professional review required before submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
