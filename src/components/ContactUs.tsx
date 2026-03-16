import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Contact Info */}
        <div className="bg-[#00263E] p-10 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-6">Get in touch</h2>
            <p className="text-blue-200 mb-8 leading-relaxed">
              Have questions about PointWise or need a custom enterprise solution? 
              Our team of medical-legal experts and engineers is here to help.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-[#E87722] mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">Phone</h3>
                  <p className="text-blue-200">+1 (888) 555-0123</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-[#E87722] mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">Email</h3>
                  <p className="text-blue-200">support@pointwise.ai</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-[#E87722] mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">Office</h3>
                  <p className="text-blue-200">
                    123 Innovation Drive<br />
                    Suite 400<br />
                    Austin, TX 78701
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-blue-900">
            <p className="text-sm text-blue-400">© 2026 PointWise AI. All rights reserved.</p>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="p-10">
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" id="name" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E87722] focus:border-transparent outline-none transition-all" placeholder="Dr. Jane Doe" />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E87722] focus:border-transparent outline-none transition-all" placeholder="jane@example.com" />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea id="message" rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E87722] focus:border-transparent outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
            </div>
            
            <button type="button" className="w-full bg-[#E87722] text-white font-bold py-3 rounded-md hover:bg-[#D06015] transition-colors shadow-md">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
