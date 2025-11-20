
export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  isDay: number;
  time: string;
  humidity: number; // OpenMeteo current API adds this now
}

export interface HourlyForecast {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
}

export interface DailyForecast {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
  locationName: string;
  latitude: number;
  longitude: number;
}

export enum AIPersona {
  METEOROLOGIST = 'Professional Meteorologist',
  COMEDIAN = 'Sarcastic Comedian',
  POET = 'Nature Poet',
  SCIENTIST = 'Data Scientist',
  MOM = 'Caring Mom'
}

export type Language = 'en' | 'id';

export interface AIAnalysisResult {
  summary: string;
  outfitRecommendation: string;
  activitySuggestion: string;
  hazards?: string;
}

export type AIProvider = 'gemini' | 'groq' | 'mistral' | 'openrouter';

export interface AIConfig {
  provider: AIProvider;
  modelId: string;
  apiKey?: string; // Optional because Gemini might use env
}

export interface FavoriteLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}