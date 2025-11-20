
import React from 'react';
import { X, Code, Layers, Award, GraduationCap, Heart } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AboutModal: React.FC<Props> = ({ isOpen, onClose, language }) => {
  const t = TRANSLATIONS[language];
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-glassBorder w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 relative">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
               <Award className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="font-bold text-xl text-white">{t.aboutApp}</h2>
                <p className="text-xs text-blue-300">SkyMind Weather AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          
          {/* Reason / Background */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-blue-400">
                <GraduationCap className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">{t.reasonTitle}</h3>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-gray-300 text-sm leading-relaxed">
                {t.reasonText}
            </div>
          </section>

          {/* Architecture & Tech Stack */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-purple-400">
                <Code className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">{t.architecture} & {t.techStack}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-800/30 border border-slate-700/50 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#61DAFB]/20 flex items-center justify-center text-[#61DAFB] font-bold text-xs">Re</div>
                    <span className="text-sm text-gray-200">React + TypeScript</span>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#38B2AC]/20 flex items-center justify-center text-[#38B2AC] font-bold text-xs">Tw</div>
                    <span className="text-sm text-gray-200">Tailwind CSS</span>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFA116]/20 flex items-center justify-center text-[#FFA116] font-bold text-xs">OM</div>
                    <span className="text-sm text-gray-200">Open-Meteo API</span>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#4285F4]/20 flex items-center justify-center text-[#4285F4] font-bold text-xs">AI</div>
                    <span className="text-sm text-gray-200">Google Gemini / LLMs</span>
                </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-emerald-400">
                <Layers className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">{t.features}</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-300 list-disc list-inside ml-2 marker:text-emerald-500">
                <li>Real-time Weather Data & Forecasting</li>
                <li>AI-Powered Weather Analysis (Outfit & Activity)</li>
                <li>Interactive Chatbot Assistant with Context Awareness</li>
                <li>Dynamic World Map & Geolocation</li>
                <li>Multi-language Support (ID/EN)</li>
            </ul>
          </section>

          {/* Thanks To */}
          <section>
             <div className="flex items-center gap-2 mb-3 text-pink-400">
                <Heart className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">{t.thanksTo}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/20 p-4 rounded-2xl text-center">
                    <div className="w-12 h-12 mx-auto bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 shadow-lg shadow-blue-500/30">RH</div>
                    <p className="font-bold text-white text-sm">Rofikul Huda</p>
                    <p className="text-[10px] text-blue-300 uppercase tracking-wider mt-1">Founder & Engineer</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-500/20 p-4 rounded-2xl text-center">
                    <div className="w-12 h-12 mx-auto bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 shadow-lg shadow-purple-500/30">RA</div>
                    <p className="font-bold text-white text-sm">Rizky Agil</p>
                    <p className="text-[10px] text-purple-300 uppercase tracking-wider mt-1">Founder & Design</p>
                </div>

                 <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/30 border border-emerald-500/20 p-4 rounded-2xl text-center">
                    <div className="w-12 h-12 mx-auto bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 shadow-lg shadow-emerald-500/30">RI</div>
                    <p className="font-bold text-white text-sm">Redika Indar W, A.Md</p>
                    <p className="text-[10px] text-emerald-300 uppercase tracking-wider mt-1">{t.teacher}</p>
                </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
