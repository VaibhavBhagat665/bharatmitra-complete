import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, this would be a fatal error.
  // For this interactive demo, we can use a fallback or show a clear message.
  console.error("API_KEY environment variable not set. Using placeholder response.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const getSystemInstruction = (lang: 'en' | 'hi') => {
    const langInstruction = lang === 'hi' ? 
    'You MUST reply in conversational Hindi using Devanagari script.' : 
    'You MUST reply in simple, conversational English.';

    return `
You are 'Bharat Mitra', a humble, supportive AI assistant helping Indian citizens.
Your goal is to explain government schemes and scholarships in a way that is very easy to understand for everyone, including students, farmers, and people in rural areas.

**IMPORTANT: ${langInstruction}**

Your Personality:
- Humble and respectful.
- Calm, friendly, and professional, like a polite government officer.
- Patient and encouraging.

How to Answer:
1.  **Simple Language:** Use simple language as instructed above. Avoid difficult words, technical jargon, and complex sentences.
2.  **Clarity is Key:** Always provide clear, concise, and accurate information.
3.  **Be Specific:** When asked about a scheme, mention key details like:
    *   What is the benefit? (Kya laabh hai?)
    *   Who can apply? (Kaun aavedan kar sakta hai?)
    *   What documents are needed? (Kya kaagazat chahiye?)
4.  **Include Links:** When relevant, include the official government website link for the scheme. For example: "You can find more information at https://pmkisan.gov.in/."
5.  **No Fancy Formatting:** Do not use markdown like **bold** or *italics*. Use simple paragraphs, bullet points (*), or numbered lists.
6.  **Professional Tone:** Do not give financial or legal advice. Do not use slang or overly casual language.
7.  **If Unsure:** If you do not have information about a specific topic, politely say so. For example: "I'm sorry, I couldn't find information on that topic, but I can help with other government schemes."
`;
};

export const getSchemeAdvice = async (query: string, lang: 'en' | 'hi'): Promise<string> => {
  if (!ai) {
    const mockResponse = lang === 'hi'
      ? "यह एक मॉक प्रतिक्रिया है क्योंकि एपीआई कुंजी कॉन्फ़िगर नहीं है। वास्तविक परिदृश्य में, मैं आपके द्वारा मांगी गई योजना के बारे में विस्तृत जानकारी प्रदान करूंगा।"
      : "This is a mock response as the API key is not configured. In a real scenario, I would provide detailed information about the scheme you asked for.";
    return new Promise(resolve => setTimeout(() => resolve(mockResponse), 1000));
  }
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: query,
        config: {
            systemInstruction: getSystemInstruction(lang),
            temperature: 0.5,
            topP: 0.95,
            topK: 64,
        }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
};

const cleanMarkdownFromResponse = (text) => {
  if (!text) return text;
  
  return text
    // Remove bold formatting (**text** or __text__)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Remove italic formatting (*text* or _text_)
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove strikethrough (~~text~~)
    .replace(/~~(.*?)~~/g, '$1')
    // Remove inline code (`text`)
    .replace(/`(.*?)`/g, '$1')
    // Remove headers (# ## ### etc.)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove list markers (- * + 1. 2. etc.)
    .replace(/^[\s]*[-\*\+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove extra whitespace and clean up
    .replace(/\n\s*\n/g, '\n')
    .trim();
};

// Update your getSchemeAdvice function to use this cleaning
export const getSchemeAdvice = async (query, language = 'en') => {
  try {
    // Your existing API call logic here...
    const response = await /* your API call */;
    
    // Clean the response text before returning
    const cleanedResponse = cleanMarkdownFromResponse(response.text);
    
    return cleanedResponse;
  } catch (error) {
    console.error('Error getting scheme advice:', error);
    throw error;
  }
};
