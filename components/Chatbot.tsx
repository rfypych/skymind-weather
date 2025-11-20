import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Trash2, Bot, User } from 'lucide-react';
import { WeatherData, AIPersona, Language, AIConfig, ChatMessage } from '../types';
import { chatWithAI } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';

interface Props {
  weatherData: WeatherData;
  persona: AIPersona;
  language: Language;
  config: AIConfig;
}

export const Chatbot: React.FC<Props> = ({ weatherData, persona, language, config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const t = TRANSLATIONS[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await chatWithAI(newMessages, weatherData, persona, language, config);
      
      const aiMsg: ChatMessage = { role: 'assistant', content: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { role: 'assistant', content: "Error communicating with AI." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-3 right-3 z-[60] p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center
          ${isOpen 
            ? 'bg-slate-800 text-gray-400 hover:text-white rotate-90' 
            : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-110 animate-bounce-subtle'
          }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-20 right-3 z-[60] w-[90vw] sm:w-[400px] max-h-[600px] h-[70vh] bg-[#0f172a]/95 border border-glassBorder rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col transition-all duration-300 origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">SkyMind Assistant</h3>
              <p className="text-[10px] text-blue-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                Online • {config.provider}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleClear} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors" title="Clear Chat">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Minimize">
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50 p-6">
              <Bot className="w-12 h-12 text-blue-400 mb-3" />
              <p className="text-sm text-white font-medium">
                {language === 'id' ? 'Tanya apa saja tentang cuaca!' : 'Ask me anything about the weather!'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {language === 'id' 
                  ? `Saya menggunakan data cuaca lokasi ${weatherData.locationName}.`
                  : `I have access to current weather data for ${weatherData.locationName}.`
                }
              </p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                ${msg.role === 'user' ? 'bg-gray-700' : 'bg-blue-600'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-gray-300" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-gray-800 text-gray-100 rounded-tr-none border border-gray-700' 
                  : 'bg-blue-600/20 text-white rounded-tl-none border border-blue-500/30'
                }`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-blue-600/20 p-4 rounded-2xl rounded-tl-none border border-blue-500/30 flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-[#0f172a]">
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === 'id' ? "Ketik pesan..." : "Type a message..."}
              disabled={isLoading}
              className="flex-grow bg-transparent text-white text-sm focus:outline-none placeholder-gray-500"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-all disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};