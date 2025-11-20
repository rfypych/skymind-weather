
import React, { useState, useEffect } from 'react';
import { X, Save, Cpu, Key, Server, ChevronRight } from 'lucide-react';
import { AIConfig, AIProvider, Language } from '../types';
import { AI_PROVIDERS, PROVIDER_MODELS, TRANSLATIONS } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: AIConfig;
  onSave: (config: AIConfig) => void;
  language: Language;
}

export const ModelSettings: React.FC<Props> = ({ isOpen, onClose, config, onSave, language }) => {
  const [tempConfig, setTempConfig] = useState<AIConfig>(config);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (isOpen) {
      setTempConfig(config);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleProviderChange = (provider: AIProvider) => {
    setTempConfig({
      ...tempConfig,
      provider,
      modelId: PROVIDER_MODELS[provider][0].id, // Reset to first model of new provider
      apiKey: '' // Clear key on provider switch for security/clarity
    });
  };

  const handleSave = () => {
    onSave(tempConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-gray-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-[#1e293b]">
          <div className="flex items-center gap-2 text-white">
            <Server className="w-5 h-5 text-blue-400" />
            <h2 className="font-semibold text-lg">{t.settings}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto">
          
          {/* Step 1: Provider Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">1</span>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t.selectProvider}
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {AI_PROVIDERS.map((prov) => (
                <button
                  key={prov.id}
                  onClick={() => handleProviderChange(prov.id)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all
                    ${tempConfig.provider === prov.id 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20 ring-2 ring-blue-500/20' 
                      : 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700'}`}
                >
                  {prov.name}
                </button>
              ))}
            </div>
          </div>

          {/* Arrow Divider */}
          <div className="flex justify-center -my-2">
            <ChevronRight className="w-5 h-5 text-gray-600 rotate-90" />
          </div>

          {/* Step 2: Model & Key */}
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">2</span>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Configuration for {AI_PROVIDERS.find(p => p.id === tempConfig.provider)?.name}
              </label>
            </div>

            <div className="space-y-4">
              {/* Model Selection */}
              <div>
                <label className="text-[10px] text-gray-500 uppercase mb-1 block">{t.selectModel}</label>
                <div className="relative">
                  <select
                    value={tempConfig.modelId}
                    onChange={(e) => setTempConfig({ ...tempConfig, modelId: e.target.value })}
                    className="w-full appearance-none bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {PROVIDER_MODELS[tempConfig.provider].map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <Cpu className="absolute right-3 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <label className="text-[10px] text-gray-500 uppercase mb-1 block">{t.apiKey}</label>
                <div className="relative">
                  <input
                    type="password"
                    value={tempConfig.apiKey || ''}
                    onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
                    placeholder={!tempConfig.apiKey ? t.usingEnv : t.apiKeyPlaceholder}
                    className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-sm"
                  />
                  <Key className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                </div>
                {!tempConfig.apiKey && (
                  <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {t.usingEnv}
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Save className="w-5 h-5" />
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};
