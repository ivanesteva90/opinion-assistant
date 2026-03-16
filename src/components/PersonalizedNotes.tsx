import { FileText } from 'lucide-react';

export default function PersonalizedNotes() {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 p-12 text-center min-h-[500px]">
      <div className="bg-emerald-50 p-6 rounded-full mb-6">
        <FileText className="h-16 w-16 text-emerald-600" />
      </div>
      <h2 className="text-3xl font-bold text-[#00263E] mb-4">Personalized Notes Assistance</h2>
      <p className="text-[#63666A] max-w-lg mb-8 text-lg">
        This tool is designed to help you quickly draft daily clinical notes, 
        SOAP notes, and patient summaries using AI-assisted templates.
      </p>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 max-w-2xl text-left">
        <h3 className="font-bold text-[#00263E] mb-2">Example Use Cases:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Summarize patient intake forms into clinical narrative.</li>
          <li>Convert bullet points into professional SOAP notes.</li>
          <li>Generate referral letters based on diagnosis.</li>
        </ul>
      </div>

      <button disabled className="mt-8 px-8 py-3 bg-[#00263E] text-white font-bold rounded-md hover:bg-[#003855] transition-colors opacity-50 cursor-not-allowed">
        Start Drafting (Demo Mode)
      </button>
    </div>
  );
}
