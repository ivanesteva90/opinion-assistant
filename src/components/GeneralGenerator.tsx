import { FileText } from 'lucide-react';

export default function GeneralGenerator() {
  return (
    <div className="w-full h-[500px] flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 p-8 text-center">
      <div className="bg-orange-50 p-6 rounded-full mb-6">
        <FileText className="h-12 w-12 text-[#E87722]" />
      </div>
      <h2 className="text-2xl font-bold text-[#00263E] mb-3">General Style Generator</h2>
      <p className="text-[#63666A] max-w-md mb-8">
        Need a medical opinion that doesn't fit the strict VA DBQ format? 
        The General Style module will support broader medical-legal formats, IME reports, and more.
      </p>
      <button disabled className="px-6 py-2 bg-gray-100 text-gray-400 font-semibold rounded-md cursor-not-allowed">
        Coming Soon
      </button>
    </div>
  );
}
