import React, { useState } from 'react';
import { HelpIcon, PlayIcon, FileIcon, AlertIcon } from '../components/Icons';

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "Machine is overheating (>85°C)",
      answer: "Stop operation immediately. Check for debris blocking the cooling vents. Ensure the ambient temperature isn't too high. If the problem persists, enable 'Eco Mode' to limit motor strain."
    },
    {
      id: 2,
      question: "Motor is jamming frequently",
      answer: "Use the 'Anti-Jam' feature in the control panel to reverse the motor. Ensure you aren't overloading the input feeder with too much raw jute at once."
    },
    {
      id: 3,
      question: "How to enable Maintenance Mode?",
      answer: "Maintenance Mode locks the motor for safety during cleaning. To enable: 1. Ensure machine is completely stopped. 2. Hold the 'Stop' button for 10 seconds until the LED flashes blue. 3. Physical cleaning can now safely proceed."
    },
    {
      id: 4,
      question: "Connection Lost / Offline",
      answer: "Check the machine's local Wi-Fi antenna. If using a GSM module, ensure the SIM card has an active plan. Try restarting the machine's main breaker."
    }
  ];

  const tutorials = [
    { id: 1, title: "Basic Ribboning Guide", duration: "2:15", color: "bg-emerald-500" },
    { id: 2, title: "Blade Replacement", duration: "5:30", color: "bg-blue-500" },
    { id: 3, title: "Cleaning Sensors", duration: "3:45", color: "bg-amber-500" },
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in pb-20 space-y-8 pt-16">
      {/* Header & Search */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-2xl flex items-center justify-center">
             <HelpIcon size={28} />
          </div>
          <div>
             <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
             <p className="text-gray-500">Tutorials, guides, and troubleshooting.</p>
          </div>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Search for issues (e.g. 'jam', 'heat')..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 px-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm"
          />
          <div className="absolute right-4 top-4 text-gray-400">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>
      </div>

      {/* Quick Fixes */}
      <div>
        <h2 className="text-lg font-bold mb-4">Quick Fixes</h2>
        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400 font-bold">
                 <AlertIcon size={20} />
                 <span>Emergency Stop</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Force shutdown all active motors immediately.</p>
           </div>
           <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                 <span>Maint. Mode</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Lock machine for safe cleaning and repair.</p>
           </div>
        </div>
      </div>

      {/* Video Tutorials */}
      <div>
        <h2 className="text-lg font-bold mb-4">Video Tutorials</h2>
        <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide flex gap-4 snap-x">
           {tutorials.map((t) => (
             <div key={t.id} className="snap-center shrink-0 w-64 group cursor-pointer">
                <div className={`relative aspect-video ${t.color} rounded-2xl flex items-center justify-center shadow-lg mb-2 overflow-hidden`}>
                   <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                   <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white pl-1 group-hover:scale-110 transition-transform">
                      <PlayIcon size={24} />
                   </div>
                   <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md font-mono">
                      {t.duration}
                   </span>
                </div>
                <h3 className="font-bold text-sm leading-tight group-hover:text-purple-500 transition-colors">{t.title}</h3>
             </div>
           ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div>
         <h2 className="text-lg font-bold mb-4">Troubleshooting & FAQ</h2>
         <div className="space-y-2">
            {filteredFaqs.map((faq) => (
               <div 
                 key={faq.id} 
                 onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                 className="bg-jute-paper dark:bg-jute-darkPaper border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden transition-all cursor-pointer"
               >
                  <div className="p-4 flex items-center justify-between font-medium">
                     {faq.question}
                     <span className={`transition-transform text-gray-400 ${expandedFaq === faq.id ? 'rotate-180' : ''}`}>
                        ▼
                     </span>
                  </div>
                  {expandedFaq === faq.id && (
                     <div className="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/5 pt-4">
                        {faq.answer}
                     </div>
                  )}
               </div>
            ))}
            {filteredFaqs.length === 0 && (
               <div className="text-center py-8 text-gray-400">No results found.</div>
            )}
         </div>
      </div>

      {/* Resources */}
      <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-6">
         <h2 className="text-lg font-bold mb-4">Downloads</h2>
         <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-white dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10">
               <div className="text-red-500"><FileIcon /></div>
               <div className="flex-1">
                  <div className="font-bold text-sm">User Manual v2.4</div>
                  <div className="text-xs text-gray-400">PDF • 2.4 MB</div>
               </div>
               <div className="text-xs font-bold text-jute-darkBlue">Download</div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-white dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10">
               <div className="text-red-500"><FileIcon /></div>
               <div className="flex-1">
                  <div className="font-bold text-sm">Safety Guidelines</div>
                  <div className="text-xs text-gray-400">PDF • 1.1 MB</div>
               </div>
               <div className="text-xs font-bold text-jute-darkBlue">Download</div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default Help;