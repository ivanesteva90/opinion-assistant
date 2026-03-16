import { Shield, Zap, Globe, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-[#00263E] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00263E] to-[#004B76] opacity-90"></div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#E87722] opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#00A9E0] opacity-10 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Professional Medical <br />
            <span className="text-[#FDBB30]">Opinion Platform</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-xl text-blue-100 leading-relaxed">
            The industry standard for generating VA DBQ nexus letters, behavioral health analysis, and comprehensive medical-legal reports.
          </p>
          
          <div className="mt-10 flex justify-center space-x-4">
            <button className="px-8 py-3 bg-[#E87722] text-white font-bold rounded-lg shadow-lg hover:bg-[#D06015] transition-all transform hover:-translate-y-1">
              Explore Solutions
            </button>
            <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-[#00263E] transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Value Props */}
      <div className="bg-[#F8F9FA] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#00263E]">Why Healthcare Professionals Choose PointWise</h2>
            <p className="mt-4 text-lg text-[#63666A]">Streamlined workflows for complex medical documentation.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-[#E87722]" />
              </div>
              <h3 className="text-xl font-bold text-[#00263E] mb-3">Legal Compliance</h3>
              <p className="text-gray-600">Our algorithms are constantly updated to reflect the latest VA standards, including CUE and Direct Service thresholds.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-[#00263E]" />
              </div>
              <h3 className="text-xl font-bold text-[#00263E] mb-3">Efficiency</h3>
              <p className="text-gray-600">Reduce drafting time by up to 80%. Generate comprehensive, cited opinions in seconds from raw clinical data.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-[#00A9E0]" />
              </div>
              <h3 className="text-xl font-bold text-[#00263E] mb-3">Accessibility</h3>
              <p className="text-gray-600">A secure, cloud-based platform that works wherever you do. HIPAA-ready infrastructure for your peace of mind.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-2xl font-bold text-[#E87722]">Point</span>
              <span className="text-2xl font-light text-[#00263E]">Wise</span>
            </div>
            <div className="flex space-x-8 text-sm text-gray-500">
              <a href="#" className="hover:text-[#E87722]">Privacy Policy</a>
              <a href="#" className="hover:text-[#E87722]">Terms of Service</a>
              <a href="#" className="hover:text-[#E87722]">Support</a>
              <a href="#" className="hover:text-[#E87722]">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-400">
            © 2026 PointWise AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
