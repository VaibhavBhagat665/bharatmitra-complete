import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { ChatMessage as ChatMessageType, MessageSender } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set. Using placeholder response.");
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const getSystemInstruction = (lang: 'en' | 'hi') => {
    const langInstruction = lang === 'hi' ? 
    'You MUST reply in conversational Hindi using Devanagari script.' : 
    'You MUST reply in simple, conversational English.';

    return `
You are 'Bharat Mitra', a humble, supportive AI assistant helping Indian citizens.
Your goal is to explain government schemes and scholarships in a way that is very easy to understand for everyone, including students, farmers, and people in rural areas.

**IMPORTANT: ${langInstruction}**

**CONTEXT AWARENESS:** You maintain context throughout the conversation. When users ask follow-up questions, refer back to previous parts of the conversation. Use phrases like "As I mentioned earlier..." or "Building on what we discussed..." to show continuity.

Your Personality:
- Humble and respectful.
- Calm, friendly, and professional, like a polite government officer.
- Patient and encouraging.
- Remember previous questions and build upon them naturally.

How to Answer:
1.  **Simple Language:** Use simple language as instructed above. Avoid difficult words, technical jargon, and complex sentences.
2.  **Clarity is Key:** Always provide clear, concise, and accurate information.
3.  **Maintain Context:** Reference previous parts of the conversation when relevant. Show that you remember what was discussed.
4.  **Be Specific:** When asked about a scheme, mention key details like:
    *   What is the benefit? (Kya laabh hai?)
    *   Who can apply? (Kaun aavedan kar sakta hai?)
    *   What documents are needed? (Kya kaagazat chahiye?)
5.  **Include Links:** When relevant, include the official government website link for the scheme.
6.  **No Fancy Formatting:** Do not use markdown like **bold** or *italics*. Use simple paragraphs, bullet points (*), or numbered lists.
7.  **Professional Tone:** Do not give financial or legal advice. Do not use slang or overly casual language.
8.  **If Unsure:** If you do not have information about a specific topic, politely say so.
`;
};

// Convert chat history to conversation context for Gemini
const buildConversationHistory = (messages: ChatMessageType[]): string => {
  if (messages.length === 0) return '';
  
  const conversationParts = messages.map(msg => {
    const role = msg.sender === MessageSender.USER ? 'User' : 'Assistant';
    return `${role}: ${msg.text}`;
  });
  
  return `Previous conversation:\n${conversationParts.join('\n')}\n\nCurrent question: `;
};

export const getSchemeAdvice = async (
  query: string, 
  lang: 'en' | 'hi',
  conversationHistory: ChatMessageType[] = []
): Promise<string> => {
  if (!genAI) {
    const mockResponse = lang === 'hi'
      ? "यह एक मॉक प्रतिक्रिया है क्योंकि एपीआई कुंजी कॉन्फ़िगर नहीं है। वास्तविक परिदृश्य में, मैं आपके द्वारा मांगी गई योजना के बारे में विस्तृत जानकारी प्रदान करूंगा और पिछली बातचीत को भी याद रखूंगा।"
      : "This is a mock response as the API key is not configured. In a real scenario, I would provide detailed information and remember our previous conversation.";
    return new Promise(resolve => setTimeout(() => resolve(mockResponse), 1000));
  }
  
  try {
    // Use the correct stable model name
    const model: GenerativeModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",  // Updated to stable version
      systemInstruction: getSystemInstruction(lang)
    });
    
    // Build the full query with conversation context
    const contextualQuery = conversationHistory.length > 0 
      ? `${buildConversationHistory(conversationHistory)}${query}`
      : query;
    
    // Use the correct API method
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: contextualQuery }] }],
      generationConfig: {
        temperature: 0.5,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 1024,
      }
    });
    
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response from API');
    }
    
    const cleanedResponse = cleanMarkdownFromResponse(text);
    
    return cleanedResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // More specific error handling
    let errorMsg = lang === 'hi'
      ? "खुशी है कि मैं अभी अपने ज्ञान आधार से जुड़ने में परेशानी हो रही है। कृपया एक पल में फिर कोशिश करें।"
      : "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        errorMsg = lang === 'hi'
          ? "एपीआई कुंजी की समस्या है। कृपया कॉन्फ़िगरेशन जांचें।"
          : "There's an API key issue. Please check the configuration.";
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMsg = lang === 'hi'
          ? "एपीआई सीमा पार हो गई है। कृपया बाद में कोशिश करें।"
          : "API limit exceeded. Please try again later.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMsg = lang === 'hi'
          ? "नेटवर्क की समस्या है। कृपया अपना इंटरनेट कनेक्शन जांचें।"
          : "Network issue. Please check your internet connection.";
      }
    }
    
    return errorMsg;
  }
};

const cleanMarkdownFromResponse = (text: string): string => {
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
