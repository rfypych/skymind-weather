import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData, AIAnalysisResult, AIPersona, Language, AIConfig } from "../types";

// Helper for formatting the prompt across all providers
const generatePrompt = (weatherData: WeatherData, persona: AIPersona, language: Language) => {
  return `
    You are a ${persona}.
    Analyze the following weather data for ${weatherData.locationName}:
    - Current Temp: ${weatherData.current.temperature}°C
    - Humidity: ${weatherData.current.humidity}%
    - Wind: ${weatherData.current.windSpeed} km/h
    - Condition Code: ${weatherData.current.weatherCode}
    - Daily Max/Min: ${weatherData.daily.temperature_2m_max[0]}°C / ${weatherData.daily.temperature_2m_min[0]}°C
    
    Instructions:
    1. Provide a valid JSON response ONLY. Do not add markdown code blocks.
    2. Keep it short, engaging, and strictly adhering to the persona.
    3. IMPORTANT: The output content MUST be in ${language === 'id' ? 'Indonesian (Bahasa Indonesia)' : 'English'}.
    
    JSON Structure:
    {
      "summary": "string",
      "outfitRecommendation": "string",
      "activitySuggestion": "string",
      "hazards": "string (optional)"
    }
  `;
};

// Gemini Specific Handler (Native SDK)
const analyzeWithGemini = async (
  prompt: string,
  modelId: string,
  userApiKey?: string
): Promise<AIAnalysisResult> => {
  // Use user provided key if exists, otherwise fall back to env
  const finalApiKey = userApiKey && userApiKey.trim() !== '' ? userApiKey : process.env.API_KEY;
  
  if (!finalApiKey) throw new Error("Missing Gemini API Key");

  const ai = new GoogleGenAI({ apiKey: finalApiKey });
  
  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A general weather summary in the requested persona voice." },
          outfitRecommendation: { type: Type.STRING, description: "Specific clothing advice based on temp and conditions." },
          activitySuggestion: { type: Type.STRING, description: "Best things to do given the weather." },
          hazards: { type: Type.STRING, description: "Any warnings like high UV, storm, or high wind. Leave empty if none." }
        },
        required: ["summary", "outfitRecommendation", "activitySuggestion"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text) as AIAnalysisResult;
};

// Generic OpenAI-Compatible Handler (Groq, Mistral, OpenRouter)
const analyzeWithOpenAICompatible = async (
  provider: string,
  prompt: string,
  modelId: string,
  apiKey?: string
): Promise<AIAnalysisResult> => {
  if (!apiKey) throw new Error(`API Key required for ${provider}`);

  let baseUrl = '';
  switch (provider) {
    case 'groq': baseUrl = 'https://api.groq.com/openai/v1/chat/completions'; break;
    case 'mistral': baseUrl = 'https://api.mistral.ai/v1/chat/completions'; break;
    case 'openrouter': baseUrl = 'https://openrouter.ai/api/v1/chat/completions'; break;
    default: throw new Error("Unknown provider");
  }

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // OpenRouter specific headers
      ...(provider === 'openrouter' ? { 'HTTP-Referer': 'https://skymind.weather', 'X-Title': 'SkyMind Weather' } : {})
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: "You are a helpful weather assistant that outputs strictly valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" } // Supported by Groq/Mistral/OpenRouter usually
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${provider} Error: ${err}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) throw new Error("Empty response from provider");
  
  try {
    return JSON.parse(content);
  } catch (e) {
    // Fallback if model didn't output perfect JSON despite instructions
    console.error("JSON Parse Error", e);
    throw new Error("Failed to parse provider response as JSON");
  }
};

export const analyzeWeather = async (
  weatherData: WeatherData,
  persona: AIPersona,
  language: Language,
  config: AIConfig
): Promise<AIAnalysisResult> => {
  const prompt = generatePrompt(weatherData, persona, language);

  try {
    if (config.provider === 'gemini') {
      return await analyzeWithGemini(prompt, config.modelId, config.apiKey);
    } else {
      return await analyzeWithOpenAICompatible(config.provider, prompt, config.modelId, config.apiKey);
    }
  } catch (error) {
    console.error("AI Service Error:", error);
    const isId = language === 'id';
    return {
      summary: isId 
        ? `Maaf, koneksi ke ${config.provider} gagal. Coba periksa API Key.` 
        : `Sorry, connection to ${config.provider} failed. Please check API Key.`,
      outfitRecommendation: isId ? "Gunakan pakaian standar." : "Wear standard clothing.",
      activitySuggestion: isId ? "Cek aplikasi cuaca lain." : "Check another weather app.",
    };
  }
};
