import React, { useState, useEffect } from 'react';
import { MapPin, Wind, Droplets, ArrowDown, ArrowUp, Globe, Users, Settings, Heart, Crosshair, Info } from 'lucide-react';
import { GeocodingResult, WeatherData, AIPersona, Language, AIConfig, FavoriteLocation } from './types';
import { DEFAULT_LAT, DEFAULT_LON, WMO_CODE_MAP, TRANSLATIONS, AI_PROVIDERS } from './constants';
import { fetchWeatherData, getCityNameFromCoords } from './services/weatherService';
import { SearchBar } from './components/SearchBar';
import { ForecastChart } from './components/ForecastChart';
import { WeatherIcon } from './components/WeatherIcon';
import { AICard } from './components/AICard';
import { ModelSettings } from './components/ModelSettings';
import { WorldMap } from './components/WorldMap';
import { Chatbot } from './components/Chatbot';
import { AboutModal } from './components/AboutModal';

const App: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<AIPersona>(AIPersona.METEOROLOGIST);
  const [language, setLanguage] = useState<Language>('id');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  
  // AI Configuration State
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: 'gemini',
    modelId: 'gemini-2.5-flash',
    apiKey: ''
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load Favorites from LocalStorage
  useEffect(() => {
    const savedFavs = localStorage.getItem('skyMindFavorites');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  const saveFavorites = (newFavs: FavoriteLocation[]) => {
    setFavorites(newFavs);
    localStorage.setItem('skyMindFavorites', JSON.stringify(newFavs));
  };

  const loadWeather = async (lat: number, lon: number, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(lat, lon, name);
      setWeather(data);
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true); // Visual feedback
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const name = await getCityNameFromCoords(lat, lon);
          loadWeather(lat, lon, name);
        },
        (err) => {
          console.error(err);
          setError("Location access denied or failed.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  // Initial Load
  useEffect(() => {
    handleGetCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocationSelect = (loc: GeocodingResult) => {
    loadWeather(loc.latitude, loc.longitude, loc.name);
  };

  const handleMapClick = async (lat: number, lon: number) => {
    const cityName = await getCityNameFromCoords(lat, lon);
    loadWeather(lat, lon, cityName);
  };

  const toggleFavorite = () => {
    if (!weather) return;
    
    // Create a simplified ID based on name and coords to check uniqueness
    const currentId = `${weather.locationName}-${weather.latitude.toFixed(2)}-${weather.longitude.toFixed(2)}`;
    
    const existingIndex = favorites.findIndex(f => f.id === currentId);
    
    if (existingIndex >= 0) {
      // Remove
      const newFavs = favorites.filter((_, i) => i !== existingIndex);
      saveFavorites(newFavs);
    } else {
      // Add
      const newFav: FavoriteLocation = {
        id: currentId,
        name: weather.locationName,
        latitude: weather.latitude,
        longitude: weather.longitude,
        country: '' // We don't strictly have country code here from just weather data easily without extra reverse geo, but name often has it. 
                    // For now we leave optional fields empty or we could parse if name has commas.
      };
      saveFavorites([...favorites, newFav]);
    }
  };

  const isCurrentFavorite = () => {
    if (!weather) return false;
    const currentId = `${weather.locationName}-${weather.latitude.toFixed(2)}-${weather.longitude.toFixed(2)}`;
    return favorites.some(f => f.id === currentId);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'id' : 'en');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
     return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
       weekday: 'long',
       day: 'numeric',
       month: 'long',
       year: 'numeric'
     });
  };

  if (loading && !weather) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-blue-300 animate-pulse">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#1e1b4b] text-white p-4 sm:p-8 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      
      {/* Animated Background Elements - Complex Ribbon Flow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <style>{`
          @keyframes flowLeftRight {
            0% { stroke-dashoffset: 1200; }
            100% { stroke-dashoffset: 0; }
          }
          .wind-ribbon {
            animation: flowLeftRight 10s linear infinite;
          }
          .ribbon-fast { animation-duration: 8s; }
          .ribbon-slow { animation-duration: 15s; }
          .ribbon-med { animation-duration: 12s; }
        `}</style>
        
        {/* Background Glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[130px] mix-blend-screen animate-pulse" style={{animationDuration: '10s'}}></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen"></div>

        {/* Complex Wind Ribbon SVG */}
        <svg className="absolute w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
             <defs>
               {/* Main Ribbon Gradient (Cyan -> Blue -> Purple) */}
               <linearGradient id="ribbonGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="rgba(6, 182, 212, 0)" /> 
                 <stop offset="20%" stopColor="rgba(6, 182, 212, 0.4)" /> {/* Cyan */}
                 <stop offset="50%" stopColor="rgba(59, 130, 246, 0.5)" /> {/* Blue */}
                 <stop offset="80%" stopColor="rgba(147, 51, 234, 0.3)" /> {/* Purple */}
                 <stop offset="100%" stopColor="rgba(147, 51, 234, 0)" />
               </linearGradient>
               
               {/* Secondary Gradient (White/Blue for highlights) */}
               <linearGradient id="ribbonGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
                 <stop offset="30%" stopColor="rgba(224, 242, 254, 0.3)" />
                 <stop offset="70%" stopColor="rgba(224, 242, 254, 0.3)" />
                 <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
               </linearGradient>
             </defs>
            
            {/* --- RIBBON 1: The Main Sweeping Wave (Bottom-Left to Top-Right) --- 
                A bundle of closely spaced lines with a deep S-curve. 
            */}
            <g className="opacity-80">
              <path d="M-100 700 C 300 700, 500 200, 1600 300" stroke="url(#ribbonGrad1)" strokeWidth="1.5" strokeDasharray="100 150" className="wind-ribbon ribbon-med" />
              <path d="M-100 708 C 310 708, 510 208, 1600 308" stroke="url(#ribbonGrad1)" strokeWidth="1.5" strokeDasharray="80 140" className="wind-ribbon ribbon-med" style={{animationDelay: '-1s'}} />
              <path d="M-100 716 C 320 716, 520 216, 1600 316" stroke="url(#ribbonGrad1)" strokeWidth="1.5" strokeDasharray="120 160" className="wind-ribbon ribbon-med" style={{animationDelay: '-2s'}} />
              <path d="M-100 724 C 330 724, 530 224, 1600 324" stroke="url(#ribbonGrad1)" strokeWidth="1.5" strokeDasharray="90 130" className="wind-ribbon ribbon-med" style={{animationDelay: '-0.5s'}} />
              <path d="M-100 732 C 340 732, 540 232, 1600 332" stroke="url(#ribbonGrad1)" strokeWidth="1.5" strokeDasharray="110 180" className="wind-ribbon ribbon-med" style={{animationDelay: '-1.5s'}} />
              <path d="M-100 740 C 350 740, 550 240, 1600 340" stroke="url(#ribbonGrad1)" strokeWidth="1.5" strokeDasharray="70 120" className="wind-ribbon ribbon-med" style={{animationDelay: '-2.5s'}} />
            </g>

            {/* --- RIBBON 2: The Lower Foundation Wave (Subtle, undulating at bottom) --- */}
            <g className="opacity-60">
              <path d="M-100 850 C 400 950, 900 750, 1600 850" stroke="url(#ribbonGrad2)" strokeWidth="1" strokeDasharray="200 200" className="wind-ribbon ribbon-slow" />
              <path d="M-100 860 C 410 960, 910 760, 1600 860" stroke="url(#ribbonGrad2)" strokeWidth="1" strokeDasharray="180 220" className="wind-ribbon ribbon-slow" style={{animationDelay: '-2s'}} />
              <path d="M-100 870 C 420 970, 920 770, 1600 870" stroke="url(#ribbonGrad2)" strokeWidth="1" strokeDasharray="220 180" className="wind-ribbon ribbon-slow" style={{animationDelay: '-4s'}} />
              <path d="M-100 880 C 430 980, 930 780, 1600 880" stroke="url(#ribbonGrad2)" strokeWidth="1" strokeDasharray="190 210" className="wind-ribbon ribbon-slow" style={{animationDelay: '-1s'}} />
              <path d="M-100 890 C 440 990, 940 790, 1600 890" stroke="url(#ribbonGrad2)" strokeWidth="1" strokeDasharray="210 190" className="wind-ribbon ribbon-slow" style={{animationDelay: '-3s'}} />
            </g>

            {/* --- RIBBON 3: The High Accent (Fast, Top Left to Mid Right) --- */}
            <g className="opacity-50">
              <path d="M-100 300 C 400 400, 800 100, 1600 150" stroke="url(#ribbonGrad1)" strokeWidth="2" strokeDasharray="50 100" className="wind-ribbon ribbon-fast" />
              <path d="M-100 310 C 410 410, 810 110, 1600 160" stroke="url(#ribbonGrad1)" strokeWidth="2" strokeDasharray="60 90" className="wind-ribbon ribbon-fast" style={{animationDelay: '-0.5s'}} />
              <path d="M-100 320 C 420 420, 820 120, 1600 170" stroke="url(#ribbonGrad1)" strokeWidth="2" strokeDasharray="40 110" className="wind-ribbon ribbon-fast" style={{animationDelay: '-1s'}} />
              <path d="M-100 330 C 430 430, 830 130, 1600 180" stroke="url(#ribbonGrad1)" strokeWidth="2" strokeDasharray="70 80" className="wind-ribbon ribbon-fast" style={{animationDelay: '-1.5s'}} />
            </g>
        </svg>
      </div>

      <ModelSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={aiConfig} 
        onSave={setAiConfig}
        language={language}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        language={language}
      />

      <div className="relative z-10">
        {/* Header / Search */}
        <header className="w-full max-w-[1600px] mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <WeatherIcon code={weather?.current.weatherCode || 0} className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              SkyMind
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SearchBar 
              onSelectLocation={handleLocationSelect} 
              language={language} 
              favorites={favorites}
            />
            
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-3 rounded-xl bg-glass border border-glassBorder hover:bg-white/10 transition-all text-sm font-semibold"
              title="Switch Language"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span>{language.toUpperCase()}</span>
            </button>

            <button 
              onClick={() => setIsAboutOpen(true)}
              className="flex items-center gap-2 px-3 py-3 rounded-xl bg-glass border border-glassBorder hover:bg-white/10 transition-all text-sm font-semibold"
              title={t.aboutApp}
            >
              <Info className="w-4 h-4 text-blue-400" />
            </button>
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-3 py-3 rounded-xl bg-glass border border-glassBorder hover:bg-white/10 transition-all text-sm font-semibold"
              title={t.settings}
            >
              <Settings className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </header>

        {error && (
          <div className="w-full max-w-[1600px] mx-auto mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {weather && (
          <>
            <main className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              
              {/* Main Weather Card */}
              <section className="lg:col-span-2 xl:col-span-3 space-y-6">
                
                {/* Current Stats - Hero */}
                <div className="bg-glass border border-glassBorder rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
                  {/* Background Decorative Gradients inside Card */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-700"></div>
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all duration-700"></div>

                  <div className="relative z-10">
                    <div className="flex flex-row items-center justify-between gap-4 mb-6">
                      
                      {/* Timestamp - Left Side */}
                      <div className="flex flex-col items-start">
                          <div className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-widest tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                              {formatTime(currentTime)}
                          </div>
                          <div className="text-xs sm:text-sm text-blue-300 font-medium uppercase tracking-wide">
                              {formatDate(currentTime)}
                          </div>
                      </div>

                      {/* Location & Controls Group - Right Side */}
                      <div className="flex items-center justify-end gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-3 py-2 rounded-xl border border-white/5 backdrop-blur-sm max-w-[120px] sm:max-w-xs lg:max-w-md">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm tracking-wider uppercase font-semibold truncate">{weather.locationName}</span>
                        </div>
                        
                        <button 
                          onClick={toggleFavorite}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors flex-shrink-0"
                          title={isCurrentFavorite() ? t.removeFromFavorites : t.addToFavorites}
                        >
                          <Heart className={`w-4 h-4 transition-all ${isCurrentFavorite() ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
                        </button>

                        <button 
                          onClick={handleGetCurrentLocation}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-300 transition-all flex items-center justify-center flex-shrink-0"
                          title={t.yourLocation}
                        >
                          <Crosshair className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
                      <div>
                        <div className="flex items-start">
                          <span className="text-8xl sm:text-9xl lg:text-[10rem] font-bold tracking-tighter text-white leading-none">
                            {Math.round(weather.current.temperature)}
                          </span>
                          <span className="text-3xl sm:text-4xl font-light text-blue-400 mt-4 lg:mt-8">°C</span>
                        </div>
                        <div className="text-xl text-gray-300 font-medium flex items-center gap-2 mt-2 ml-2">
                          {language === 'id' 
                            ? WMO_CODE_MAP[weather.current.weatherCode]?.label_id 
                            : WMO_CODE_MAP[weather.current.weatherCode]?.label}
                        </div>
                      </div>

                      {/* Enlarged Details Cards with Larger Icons and Text */}
                      <div className="w-full md:w-auto grid grid-cols-3 gap-4 lg:gap-6">
                        <div className="flex flex-col items-center md:items-start p-5 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                          <Wind className="w-8 h-8 text-blue-400 mb-3" />
                          <span className="text-base text-gray-400 font-medium">{t.wind}</span>
                          <span className="font-bold text-xl md:text-2xl mt-1">{weather.current.windSpeed} <span className="text-sm font-normal text-gray-500">km/h</span></span>
                        </div>
                        <div className="flex flex-col items-center md:items-start p-5 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                          <Droplets className="w-8 h-8 text-blue-400 mb-3" />
                          <span className="text-base text-gray-400 font-medium">{t.humidity}</span>
                          <span className="font-bold text-xl md:text-2xl mt-1">{weather.current.humidity} <span className="text-sm font-normal text-gray-500">%</span></span>
                        </div>
                        <div className="flex flex-col items-center md:items-start p-5 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                          <div className="flex gap-2 mb-3">
                              <ArrowUp className="w-8 h-8 text-red-400" />
                              <ArrowDown className="w-8 h-8 text-blue-400" />
                          </div>
                          <span className="text-base text-gray-400 font-medium">{t.highLow}</span>
                          <span className="font-bold text-xl md:text-2xl mt-1 whitespace-nowrap">
                            {Math.round(weather.daily.temperature_2m_max[0])}° / {Math.round(weather.daily.temperature_2m_min[0])}°
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Forecast Chart */}
                <div className="bg-glass border border-glassBorder rounded-3xl p-6 backdrop-blur-md">
                  <h3 className="text-lg font-semibold mb-2">{t.forecast24h}</h3>
                  <ForecastChart data={weather.hourly} />
                </div>

                {/* Interactive World Map */}
                <WorldMap 
                  lat={weather.latitude} 
                  lon={weather.longitude} 
                  onLocationSelect={handleMapClick}
                />

                {/* Data Source */}
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300 text-sm font-medium">{t.dataSource}</span>
                    <span className="font-bold text-sm">Open-Meteo & OpenStreetMap</span>
                  </div>
                  <span className="text-[10px] text-blue-300/60">Free Non-Commercial</span>
                </div>

              </section>

              {/* Sidebar: AI & Details */}
              <aside className="flex flex-col gap-6">
                <div className="flex-grow">
                  <AICard 
                    weatherData={weather} 
                    persona={persona} 
                    onPersonaChange={setPersona} 
                    language={language}
                    config={aiConfig}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                  />
                </div>
                
                {/* Founders / About Panel */}
                <div className="bg-glass border border-glassBorder rounded-3xl p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-4 text-blue-300">
                    <Users className="w-5 h-5" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">{t.about}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-default">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        RH
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">Rofikul Huda</p>
                        <p className="text-[10px] text-blue-200 uppercase tracking-wide">Founder & Eng.</p>
                      </div>
                    </div>

                    <div className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-default">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                        RA
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">Rizky Agil</p>
                        <p className="text-[10px] text-purple-200 uppercase tracking-wide">Founder & Design</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extra Info Panel */}
                <div className="bg-glass border border-glassBorder rounded-3xl p-6 backdrop-blur-md text-center">
                  <p className="text-xs text-gray-400 mb-2">{t.poweredBy}</p>
                  <div className="flex justify-center items-center gap-4">
                      <span className="text-sm font-semibold text-white">
                        {AI_PROVIDERS.find(p => p.id === aiConfig.provider)?.name || 'AI'}
                      </span>
                      <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                      <span className="text-sm font-semibold text-white">React</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-4">
                    Integrated with scalable AI architecture. <br/>
                    Compatible with Mistral/Groq via adapter.
                  </p>
                </div>
              </aside>

            </main>

            {/* Chatbot Overlay */}
            <Chatbot 
              weatherData={weather} 
              persona={persona} 
              language={language} 
              config={aiConfig} 
            />
          </>
        )}
      </div>
    </div>
  );
};

export default App;