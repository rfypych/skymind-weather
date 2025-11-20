
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

export const WMO_CODE_MAP: Record<number, { label: string; label_id: string; icon: any }> = {
  0: { label: 'Clear sky', label_id: 'Cerah', icon: Sun },
  1: { label: 'Mainly clear', label_id: 'Cerah Berawan', icon: Sun },
  2: { label: 'Partly cloudy', label_id: 'Berawan Sebagian', icon: Cloud },
  3: { label: 'Overcast', label_id: 'Mendung', icon: Cloud },
  45: { label: 'Fog', label_id: 'Kabut', icon: CloudFog },
  48: { label: 'Depositing rime fog', label_id: 'Kabut Rime', icon: CloudFog },
  51: { label: 'Light drizzle', label_id: 'Gerimis Ringan', icon: CloudDrizzle },
  53: { label: 'Moderate drizzle', label_id: 'Gerimis Sedang', icon: CloudDrizzle },
  55: { label: 'Dense drizzle', label_id: 'Gerimis Lebat', icon: CloudDrizzle },
  61: { label: 'Slight rain', label_id: 'Hujan Ringan', icon: CloudRain },
  63: { label: 'Moderate rain', label_id: 'Hujan Sedang', icon: CloudRain },
  65: { label: 'Heavy rain', label_id: 'Hujan Lebat', icon: CloudRain },
  71: { label: 'Slight snow', label_id: 'Salju Ringan', icon: CloudSnow },
  73: { label: 'Moderate snow', label_id: 'Salju Sedang', icon: CloudSnow },
  75: { label: 'Heavy snow', label_id: 'Salju Lebat', icon: CloudSnow },
  77: { label: 'Snow grains', label_id: 'Butiran Salju', icon: CloudSnow },
  80: { label: 'Slight rain showers', label_id: 'Hujan Rintik Ringan', icon: CloudRain },
  81: { label: 'Moderate rain showers', label_id: 'Hujan Rintik Sedang', icon: CloudRain },
  82: { label: 'Violent rain showers', label_id: 'Hujan Rintik Deras', icon: CloudRain },
  85: { label: 'Slight snow showers', label_id: 'Hujan Salju Ringan', icon: CloudSnow },
  86: { label: 'Heavy snow showers', label_id: 'Hujan Salju Lebat', icon: CloudSnow },
  95: { label: 'Thunderstorm', label_id: 'Badai Petir', icon: CloudLightning },
  96: { label: 'Thunderstorm with hail', label_id: 'Badai Petir & Hujan Es', icon: CloudLightning },
  99: { label: 'Thunderstorm with heavy hail', label_id: 'Badai Petir & Hujan Es Lebat', icon: CloudLightning },
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
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B' },
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
