
import { 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Cloud, 
  CloudFog, 
  CloudDrizzle,
  Wind
} from "lucide-react";
import { Language, AIProvider } from "./types";

export const WMO_CODE_MAP: Record<number, { label: string; icon: any }> = {
  0: { label: 'Clear sky', icon: Sun },
  1: { label: 'Mainly clear', icon: Sun },
  2: { label: 'Partly cloudy', icon: Cloud },
  3: { label: 'Overcast', icon: Cloud },
  45: { label: 'Fog', icon: CloudFog },
  48: { label: 'Depositing rime fog', icon: CloudFog },
  51: { label: 'Light drizzle', icon: CloudDrizzle },
  53: { label: 'Moderate drizzle', icon: CloudDrizzle },
  55: { label: 'Dense drizzle', icon: CloudDrizzle },
  61: { label: 'Slight rain', icon: CloudRain },
  63: { label: 'Moderate rain', icon: CloudRain },
  65: { label: 'Heavy rain', icon: CloudRain },
  71: { label: 'Slight snow', icon: CloudSnow },
  73: { label: 'Moderate snow', icon: CloudSnow },
  75: { label: 'Heavy snow', icon: CloudSnow },
  77: { label: 'Snow grains', icon: CloudSnow },
  80: { label: 'Slight rain showers', icon: CloudRain },
  81: { label: 'Moderate rain showers', icon: CloudRain },
  82: { label: 'Violent rain showers', icon: CloudRain },
  85: { label: 'Slight snow showers', icon: CloudSnow },
  86: { label: 'Heavy snow showers', icon: CloudSnow },
  95: { label: 'Thunderstorm', icon: CloudLightning },
  96: { label: 'Thunderstorm with hail', icon: CloudLightning },
  99: { label: 'Thunderstorm with heavy hail', icon: CloudLightning },
};

export const DEFAULT_LAT = -6.2088; // Jakarta
export const DEFAULT_LON = 106.8456;

export const AI_PROVIDERS: { id: AIProvider; name: string }[] = [
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'groq', name: 'Groq' },
  { id: 'mistral', name: 'Mistral AI' },
  { id: 'openrouter', name: 'OpenRouter' },
];

export const PROVIDER_MODELS: Record<AIProvider, { id: string; name: string }[]> = {
  gemini: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro' },
  ],
  groq: [
    { id: 'llama3-8b-8192', name: 'Llama 3 8B' },
    { id: 'llama3-70b-8192', name: 'Llama 3 70B' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7b' },
  ],
  mistral: [
    { id: 'mistral-tiny', name: 'Mistral Tiny' },
    { id: 'mistral-small', name: 'Mistral Small' },
    { id: 'mistral-medium', name: 'Mistral Medium' },
  ],
  openrouter: [
    { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo (via OR)' },
    { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku (via OR)' },
    { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5 (via OR)' },
  ]
};

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    searchPlaceholder: "Search city...",
    wind: "Wind",
    humidity: "Humidity",
    highLow: "H / L",
    forecast24h: "24h Forecast",
    dataSource: "Data Source",
    aiInsight: "AI Insight",
    consulting: "Consulting the digital oracle...",
    regenerate: "Regenerate Insight",
    outfit: "Outfit",
    activity: "Activity",
    warning: "Warning",
    poweredBy: "Powered by",
    loading: "Loading weather data...",
    error: "Unable to fetch weather data.",
    yourLocation: "Your Location",
    about: "About Team",
    founders: "Founders",
    settings: "Model Settings",
    changeModel: "Change Model",
    selectProvider: "Select Service",
    selectModel: "Select Model",
    apiKey: "API Key",
    apiKeyPlaceholder: "Enter your API Key",
    save: "Save Configuration",
    cancel: "Cancel",
    usingEnv: "Using default environment key",
    favorites: "Favorite Locations",
    addToFavorites: "Add to Favorites",
    removeFromFavorites: "Remove from Favorites",
    noFavorites: "No favorite locations yet"
  },
  id: {
    searchPlaceholder: "Cari kota...",
    wind: "Angin",
    humidity: "Kelembapan",
    highLow: "T / R",
    forecast24h: "Prakiraan 24 Jam",
    dataSource: "Sumber Data",
    aiInsight: "Analisis AI",
    consulting: "Menghubungi satelit AI...",
    regenerate: "Analisis Ulang",
    outfit: "Pakaian",
    activity: "Aktivitas",
    warning: "Peringatan",
    poweredBy: "Ditenagai oleh",
    loading: "Memuat data cuaca...",
    error: "Gagal mengambil data cuaca.",
    yourLocation: "Lokasi Anda",
    about: "Tentang Tim",
    founders: "Pendiri",
    settings: "Pengaturan Model",
    changeModel: "Ganti Model",
    selectProvider: "Pilih Layanan",
    selectModel: "Pilih Model",
    apiKey: "Kunci API",
    apiKeyPlaceholder: "Masukkan Kunci API Anda",
    save: "Simpan Konfigurasi",
    cancel: "Batal",
    usingEnv: "Menggunakan kunci default sistem",
    favorites: "Lokasi Favorit",
    addToFavorites: "Tambah ke Favorit",
    removeFromFavorites: "Hapus dari Favorit",
    noFavorites: "Belum ada lokasi favorit"
  }
};
