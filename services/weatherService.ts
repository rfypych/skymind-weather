import { WeatherData, GeocodingResult, Language } from '../types';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_GEO_URL = 'https://nominatim.openstreetmap.org/reverse';

export const searchLocation = async (query: string, lang: Language = 'en'): Promise<GeocodingResult[]> => {
  if (query.length < 2) return [];
  try {
    // Open Meteo Geocoding supports 'en', 'de', 'fr', 'it', 'es' etc. 'id' might fallback to local names.
    const response = await fetch(`${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=${lang}&format=json`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Geocoding error:", error);
    return [];
  }
};

export const getCityNameFromCoords = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(`${REVERSE_GEO_URL}?lat=${lat}&lon=${lon}&format=json&zoom=10`, {
      headers: {
        'User-Agent': 'SkyMindWeather/1.0'
      }
    });
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Unknown Location";
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  }
};

export const fetchWeatherData = async (lat: number, lon: number, name: string): Promise<WeatherData> => {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day',
    hourly: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '3'
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch weather data');
  
  const data = await response.json();

  return {
    locationName: name,
    latitude: lat,
    longitude: lon,
    current: {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day,
      time: data.current.time,
    },
    hourly: data.hourly,
    daily: data.daily,
  };
};

// Tool for AI to fetch real-time data
export const getWeatherSummary = async (city: string): Promise<any> => {
  try {
    // Default to English for AI search to ensure better matching
    const locations = await searchLocation(city, 'en');
    if (!locations || locations.length === 0) {
      return { error: `Location '${city}' not found. Please check spelling.` };
    }
    
    // Use the first result
    const location = locations[0];
    const data = await fetchWeatherData(location.latitude, location.longitude, location.name);
    
    return {
      location: data.locationName,
      country: location.country,
      coordinates: { lat: data.latitude, lon: data.longitude },
      current: {
        temperature: `${data.current.temperature}°C`,
        humidity: `${data.current.humidity}%`,
        windSpeed: `${data.current.windSpeed} km/h`,
        conditionCode: data.current.weatherCode,
        isDay: data.current.isDay ? 'Yes' : 'No',
        time: data.current.time
      },
      dailyForecast: {
        todayMax: `${data.daily.temperature_2m_max[0]}°C`,
        todayMin: `${data.daily.temperature_2m_min[0]}°C`
      }
    };
  } catch (error) {
    console.error("Tool Error", error);
    return { error: "Failed to fetch weather data from API." };
  }
};
