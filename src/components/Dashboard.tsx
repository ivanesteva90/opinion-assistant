import { FileText, ShieldCheck, Brain, Stethoscope, ChevronRight, Lock } from 'lucide-react';

interface DashboardProps {
  onSelectService: (service: 'dbq' | 'rbt' | 'general' | 'notes') => void;
}

export default function Dashboard({ onSelectService }: DashboardProps) {
  const services = [
    {
      id: 'dbq',
      title: 'VA DBQ-Style Nexus',
      description: 'Generate precise nexus opinions compliant with VA standards (Direct Service & CUE).',
      icon: ShieldCheck,
      color: 'text-[#E87722]',
      bg: 'bg-orange-50',
      status: 'Available',
    },
    {
      id: 'rbt',
      title: 'Rational Behavior Therapy',
      description: 'Advanced psychological analysis and behavioral health reporting tools.',
      icon: Brain,
      color: 'text-[#00263E]',
      bg: 'bg-blue-50',
      status: 'Available',
    },
    {
      id: 'general',
      title: 'General Medical Reports',
      description: 'Flexible reporting for Independent Medical Examinations (IME) and summaries.',
      icon: Stethoscope,
      color: 'text-[#00A9E0]',
      bg: 'bg-cyan-50',
      status: 'Available',
    },
    {
      id: 'notes',
      title: 'Personalized Notes Assistance',
      description: 'AI-driven assistance for drafting daily clinical notes and patient summaries.',
      icon: FileText,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      status: 'Available',
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-[#00263E] mb-4">Select a Service</h2>
        <p className="text-[#63666A] max-w-2xl mx-auto">
          Choose from our suite of specialized tools tailored for healthcare professionals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {services.map((service) => (
          <div 
            key={service.id}
            onClick={() => {
              if (service.status === 'Available') {
                onSelectService(service.id as any);
              }
            }}
            className={`relative bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer ${service.status !== 'Available' ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-1'}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`${service.bg} p-4 rounded-lg`}>
                <service.icon className={`h-8 w-8 ${service.color}`} />
              </div>
              {service.status !== 'Available' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <Lock className="w-3 h-3 mr-1" />
                  {service.status}
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-[#00263E] mb-3 group-hover:text-[#E87722] transition-colors">
              {service.title}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {service.description}
            </p>
            
            <div className={`flex items-center font-semibold text-sm ${service.status === 'Available' ? 'text-[#E87722]' : 'text-gray-400'}`}>
              {service.status === 'Available' ? 'Launch Tool' : 'Locked'}
              <ChevronRight className={`ml-1 h-4 w-4 transition-transform ${service.status === 'Available' ? 'group-hover:translate-x-1' : ''}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
