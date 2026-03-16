import { Brain } from 'lucide-react';

export default function RBTGenerator() {
  return (
    <div className="w-full h-[500px] flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 p-8 text-center">
      <div className="bg-blue-50 p-6 rounded-full mb-6">
        <Brain className="h-12 w-12 text-[#00263E]" />
      </div>
      <h2 className="text-2xl font-bold text-[#00263E] mb-3">RBT Generator</h2>
      <p className="text-[#63666A] max-w-md mb-8">
        The Rational Behavior Therapy (RBT) module is currently under development. 
        This tool will allow for specific psychological evaluations and behavioral analysis opinions.
      </p>
      <button disabled className="px-6 py-2 bg-gray-100 text-gray-400 font-semibold rounded-md cursor-not-allowed">
        Coming Soon
      </button>
    </div>
  );
}
