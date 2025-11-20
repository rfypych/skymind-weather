import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Shirt, Activity, AlertTriangle, Settings } from 'lucide-react';
import { WeatherData, AIPersona, AIAnalysisResult, Language, AIConfig } from '../types';
import { analyzeWeather } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';

interface Props {
  weatherData: WeatherData;
  persona: AIPersona;
  language: Language;
  onPersonaChange: (p: AIPersona) => void;
  config: AIConfig;
  onOpenSettings: () => void;
}

export const AICard: React.FC<Props> = ({ weatherData, persona, language, onPersonaChange, config, onOpenSettings }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const t = TRANSLATIONS[language];

  const handleAnalysis = async () => {
    setLoading(true);
    const result = await analyzeWeather(weatherData, persona, language, config);
    setAnalysis(result);
    setLoading(false);
  };

  // Re-analyze when persona, weather location, language, OR config changes
  useEffect(() => {
    handleAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherData.locationName, persona, language, config]);

  return (
    <div className="bg-glass border border-glassBorder rounded-3xl p-6 backdrop-blur-md flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold text-lg">{t.aiInsight}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={persona}
            onChange={(e) => onPersonaChange(e.target.value as AIPersona)}
            className="bg-slate-800 text-xs text-white border border-slate-600 rounded-lg px-2 py-1 focus:outline-none hover:bg-slate-700 transition-colors max-w-[120px]"
          >
            {Object.values(AIPersona).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          
          <button 
            onClick={onOpenSettings}
            className="px-3 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/40 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            {t.changeModel}
          </button>
        </div>
      </div>

      <div className="flex-grow space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 animate-pulse">
            <Sparkles className="h-8 w-8 text-blue-400 animate-spin" />
            <span className="text-sm text-gray-400">{t.consulting}</span>
            <span className="text-xs text-gray-500">via {config.provider}</span>
          </div>
        ) : analysis ? (
          <>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 relative group">
              <p className="text-sm sm:text-base leading-relaxed text-white font-medium">"{analysis.summary}"</p>
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[10px] text-gray-500 bg-black/50 px-2 py-1 rounded-full border border-white/10">
                   {config.provider} / {config.modelId}
                 </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                 <Shirt className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                 <div>
                   <span className="text-xs font-bold text-blue-300 uppercase tracking-wide">{t.outfit}</span>
                   <p className="text-sm text-gray-200 mt-1 leading-snug">{analysis.outfitRecommendation}</p>
                 </div>
               </div>

               <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                 <Activity className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                 <div>
                   <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">{t.activity}</span>
                   <p className="text-sm text-gray-200 mt-1 leading-snug">{analysis.activitySuggestion}</p>
                 </div>
               </div>
            </div>

            {analysis.hazards && (
               <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                 <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                 <div>
                   <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">{t.warning}</span>
                   <p className="text-sm text-gray-200 mt-1 leading-snug">{analysis.hazards}</p>
                 </div>
               </div>
            )}
          </>
        ) : null}
      </div>

      <button 
        onClick={handleAnalysis}
        disabled={loading}
        className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        {t.regenerate}
      </button>
    </div>
  );
};