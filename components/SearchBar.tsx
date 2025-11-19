
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Star } from 'lucide-react';
import { searchLocation } from '../services/weatherService';
import { GeocodingResult, Language, FavoriteLocation } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  onSelectLocation: (location: GeocodingResult) => void;
  language: Language;
  favorites: FavoriteLocation[];
}

export const SearchBar: React.FC<Props> = ({ onSelectLocation, language, favorites }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        const locs = await searchLocation(query, language);
        setResults(locs);
        setLoading(false);
        setIsOpen(true);
      } else if (query.length === 0) {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, language]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleSelect = (loc: GeocodingResult) => {
    onSelectLocation(loc);
    setQuery('');
    setIsOpen(false);
  };

  const handleSelectFavorite = (fav: FavoriteLocation) => {
    // Convert FavoriteLocation to GeocodingResult format for the handler
    const loc: GeocodingResult = {
      id: parseInt(fav.id) || Date.now(), // Fallback ID
      name: fav.name,
      latitude: fav.latitude,
      longitude: fav.longitude,
      country: fav.country || '',
      admin1: fav.admin1
    };
    onSelectLocation(loc);
    setQuery('');
    setIsOpen(false);
  };

  const showFavorites = query.length < 2 && favorites.length > 0;

  return (
    <div className="relative w-full max-w-md z-50" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full bg-glass border border-glassBorder text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all backdrop-blur-md placeholder-gray-400"
          placeholder={TRANSLATIONS[language].searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
        />
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        {loading && (
          <div className="absolute right-3 top-3.5 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-blue-500"></div>
        )}
      </div>

      {isOpen && (
        <div className="absolute mt-2 w-full bg-[#1e293b] border border-glassBorder rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 max-h-80 overflow-y-auto">
          
          {/* Favorites Section */}
          {showFavorites && (
            <div className="border-b border-white/10">
              <div className="px-4 py-2 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                {t.favorites}
              </div>
              {favorites.map((fav) => (
                <button
                  key={`fav-${fav.id}`}
                  onClick={() => handleSelectFavorite(fav)}
                  className="w-full text-left px-4 py-3 hover:bg-amber-500/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0 group"
                >
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <div>
                    <p className="font-medium text-white group-hover:text-amber-200 transition-colors">{fav.name}</p>
                    <p className="text-xs text-gray-400">{fav.admin1 ? `${fav.admin1}, ` : ''}{fav.country}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div>
              {showFavorites && (
                <div className="px-4 py-2 text-[10px] uppercase font-bold text-gray-500 tracking-wider bg-slate-900/50">
                  Results
                </div>
              )}
              {results.map((res) => (
                <button
                  key={res.id}
                  onClick={() => handleSelect(res)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-600/20 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                >
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">{res.name}</p>
                    <p className="text-xs text-gray-400">{res.admin1 ? `${res.admin1}, ` : ''}{res.country}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* No results message */}
          {query.length >= 2 && results.length === 0 && !loading && (
             <div className="px-4 py-3 text-sm text-gray-400 text-center">
               No locations found
             </div>
          )}
        </div>
      )}
    </div>
  );
};
