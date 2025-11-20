

import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { WeatherData, AIAnalysisResult, AIPersona, Language, AIConfig, ChatMessage } from "../types";
import { getWeatherSummary } from "./weatherService";
import { WMO_CODE_MAP } from "../constants";

// Helper for formatting the prompt across all providers
const generatePrompt = (weatherData: WeatherData, persona: AIPersona, language: Language) => {
  const condition = language === 'id' 
    ? WMO_CODE_MAP[weatherData.current.weatherCode]?.label_id 
    : WMO_CODE_MAP[weatherData.current.weatherCode]?.label;

  return `
    You are a ${persona}.
    Analyze the following weather data for ${weatherData.locationName}:
    - Current Temp: ${weatherData.current.temperature}°C
    - Humidity: ${weatherData.current.humidity}%
    - Wind: ${weatherData.current.windSpeed} km/h
    - Condition: ${condition} (Code ${weatherData.current.weatherCode})
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

// Construct a system context for the chatbot
const generateChatSystemContext = (weatherData: WeatherData, persona: AIPersona, language: Language) => {
  const condition = language === 'id' 
    ? WMO_CODE_MAP[weatherData.current.weatherCode]?.label_id 
    : WMO_CODE_MAP[weatherData.current.weatherCode]?.label;

   return `
    You are SkyMind Assistant, a helpful AI weather assistant with the persona: ${persona}.
    You were created by the SkyMind Team, founded by Rofikul Huda (Engineering) and Rizky Agil (Design).
    
    CURRENT CONTEXT (User's current location):
    - Location: ${weatherData.locationName}
    - Temperature: ${weatherData.current.temperature}°C
    - Condition: ${condition} (Code ${weatherData.current.weatherCode})
    
    Guidelines:
    1. Answer questions about the current location using the context above.
    2. IF the user asks about a DIFFERENT city (e.g. "What's the weather in Tokyo?"), USE THE PROVIDED TOOL 'get_current_weather' to fetch data. Do not guess.
    3. Respond in ${language === 'id' ? 'Indonesian (Bahasa Indonesia)' : 'English'}.
    4. Be conversational and helpful.
    5. If asked about your identity or creators, mention you are SkyMind Assistant created by Rofikul Huda and Rizky Agil.
  `;
};

// Tool Definitions
const GEMINI_TOOLS = [{
  functionDeclarations: [
    {
      name: "get_current_weather",
      description: "Get real-time weather data for a specific city name.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          city: {
            type: Type.STRING,
            description: "The name of the city (e.g. London, Tokyo, Jakarta)"
          }
        },
        required: ["city"]
      }
    }
  ]
}];

const OPENAI_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_current_weather",
      description: "Get real-time weather data for a specific city name.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The name of the city (e.g. London, Tokyo, Jakarta)"
          }
        },
        required: ["city"]
      }
    }
  }
];


// Gemini Specific Handler (Native SDK) for Analysis Card
const analyzeWithGemini = async (
  prompt: string,
  modelId: string,
  userApiKey?: string
): Promise<AIAnalysisResult> => {
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

// Generic OpenAI-Compatible Handler for Analysis Card
const analyzeWithOpenAICompatible = async (
  provider: string,
  prompt: string,
  modelId: string,
  apiKey?: string
): Promise<AIAnalysisResult> => {
  const finalApiKey = apiKey && apiKey.trim() !== '' ? apiKey : process.env.API_KEY;
  if (!finalApiKey) throw new Error(`API Key required for ${provider}`);

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
      'Authorization': `Bearer ${finalApiKey}`,
      'Content-Type': 'application/json',
      ...(provider === 'openrouter' ? { 'HTTP-Referer': 'https://skymind.weather', 'X-Title': 'SkyMind Weather' } : {})
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: "You are a helpful weather assistant that outputs strictly valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
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

// --- CHAT FUNCTIONALITY WITH TOOLS ---

const chatWithGemini = async (
  messages: ChatMessage[],
  systemContext: string,
  modelId: string,
  userApiKey?: string
): Promise<string> => {
  const finalApiKey = userApiKey && userApiKey.trim() !== '' ? userApiKey : process.env.API_KEY;
  if (!finalApiKey) throw new Error("Missing Gemini API Key");

  const ai = new GoogleGenAI({ apiKey: finalApiKey });
  
  // Map history, filtering out system messages as they go to config
  const history = messages
    .filter(m => m.role !== 'system')
    .slice(0, -1)
    .map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

  const lastMessage = messages[messages.length - 1].content;

  const chat = ai.chats.create({
    model: modelId,
    history: history,
    config: {
      systemInstruction: systemContext,
      tools: GEMINI_TOOLS,
    }
  });

  let result = await chat.sendMessage({ message: lastMessage });
  
  // Handle Function Calling Loop
  let loopCount = 0;
  const MAX_LOOPS = 5;

  while (result.functionCalls && result.functionCalls.length > 0 && loopCount < MAX_LOOPS) {
    loopCount++;
    const call = result.functionCalls[0];
    
    if (call.name === "get_current_weather" && call.args) {
      const city = call.args['city'] as string;
      // console.log(`[Gemini] Tool Call: get_current_weather(${city})`);
      
      const toolResult = await getWeatherSummary(city);
      
      // Send the tool result back to Gemini
      result = await chat.sendMessage({
        message: [{
          functionResponse: {
            name: "get_current_weather",
            response: { result: toolResult },
            id: call.id
          }
        }]
      });
    }
  }

  return result.text || "";
};

const chatWithOpenAICompatible = async (
  provider: string,
  messages: ChatMessage[],
  systemContext: string,
  modelId: string,
  apiKey?: string
): Promise<string> => {
  const finalApiKey = apiKey && apiKey.trim() !== '' ? apiKey : process.env.API_KEY;
  if (!finalApiKey) throw new Error(`API Key required for ${provider}`);

  let baseUrl = '';
  switch (provider) {
    case 'groq': baseUrl = 'https://api.groq.com/openai/v1/chat/completions'; break;
    case 'mistral': baseUrl = 'https://api.mistral.ai/v1/chat/completions'; break;
    case 'openrouter': baseUrl = 'https://openrouter.ai/api/v1/chat/completions'; break;
    default: throw new Error("Unknown provider");
  }

  // Prepare messages
  let currentMessages: any[] = [
    { role: "system", content: systemContext },
    ...messages
  ];

  const makeRequest = async (msgs: any[]) => {
    return fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${finalApiKey}`,
        'Content-Type': 'application/json',
        ...(provider === 'openrouter' ? { 'HTTP-Referer': 'https://skymind.weather', 'X-Title': 'SkyMind Weather' } : {})
      },
      body: JSON.stringify({
        model: modelId,
        messages: msgs,
        temperature: 0.7,
        tools: OPENAI_TOOLS,
        tool_choice: "auto"
      })
    });
  };

  let response = await makeRequest(currentMessages);
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${provider} Error: ${err}`);
  }

  let data = await response.json();
  let message = data.choices[0]?.message;

  // Handle Tool Calls Loop
  let loopCount = 0;
  const MAX_LOOPS = 5;

  while (message?.tool_calls && message.tool_calls.length > 0 && loopCount < MAX_LOOPS) {
    loopCount++;
    
    // Append assistant's tool call message to history
    currentMessages.push(message);

    for (const toolCall of message.tool_calls) {
      if (toolCall.function.name === 'get_current_weather') {
        const args = JSON.parse(toolCall.function.arguments);
        const city = args.city;
        // console.log(`[${provider}] Tool Call: get_current_weather(${city})`);
        
        const toolResult = await getWeatherSummary(city);
        
        // Append tool result message
        currentMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        });
      }
    }

    // Call API again with updated history
    response = await makeRequest(currentMessages);
    if (!response.ok) break;
    
    data = await response.json();
    message = data.choices[0]?.message;
  }

  return message?.content || "";
};

export const chatWithAI = async (
  messages: ChatMessage[],
  weatherData: WeatherData,
  persona: AIPersona,
  language: Language,
  config: AIConfig
): Promise<string> => {
  const systemContext = generateChatSystemContext(weatherData, persona, language);

  try {
    if (config.provider === 'gemini') {
      return await chatWithGemini(messages, systemContext, config.modelId, config.apiKey);
    } else {
      return await chatWithOpenAICompatible(config.provider, messages, systemContext, config.modelId, config.apiKey);
    }
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return language === 'id' 
      ? `Maaf, terjadi error: ${errorMessage}. Coba periksa API Key di pengaturan.` 
      : `I apologize, an error occurred: ${errorMessage}. Please check your API Key in settings.`;
  }
};
