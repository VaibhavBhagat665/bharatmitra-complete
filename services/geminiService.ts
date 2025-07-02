import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage as ChatMessageType, MessageSender } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
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
  if (!ai) {
    const mockResponse = lang === 'hi'
      ? "यह एक मॉक प्रतिक्रिया है क्योंकि एपीआई कुंजी कॉन्फ़िगर नहीं है। वास्तविक परिदृश्य में, मैं आपके द्वारा मांगी गई योजना के बारे में विस्तृत जानकारी प्रदान करूंगा और पिछली बातचीत को भी याद रखूंगा।"
      : "This is a mock response as the API key is not configured. In a real scenario, I would provide detailed information and remember our previous conversation.";
    return new Promise(resolve => setTimeout(() => resolve(mockResponse), 1000));
  }
  
  try {
    // Build the full query with conversation context
    const contextualQuery = conversationHistory.length > 0 
      ? `${buildConversationHistory(conversationHistory)}${query}`
      : query;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: contextualQuery,
        config: {
            systemInstruction: getSystemInstruction(lang),
            temperature: 0.5,
            topP: 0.95,
            topK: 64,
        }
    });
    
    const cleanedResponse = cleanMarkdownFromResponse(response.text());
    
    return cleanedResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    const errorMsg = lang === 'hi'
      ? "खुशी है कि मैं अभी अपने ज्ञान आधार से जुड़ने में परेशानी हो रही है। कृपया एक पल में फिर कोशिश करें।"
      : "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
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
