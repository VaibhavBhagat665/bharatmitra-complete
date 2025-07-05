import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set. Using placeholder response.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Keyword mapping for scheme identification
const SCHEME_KEYWORDS = {
  education: {
    en: ['student', 'scholarship', 'education', 'study', 'college', 'school', 'fees', 'tuition', 'books', 'merit'],
    hi: ['छात्र', 'छात्रवृत्ति', 'शिक्षा', 'पढ़ाई', 'कॉलेज', 'स्कूल', 'फीस', 'किताब', 'मेधावी'],
    schemes: [
      'PM Scholarship Scheme',
      'National Scholarship Portal',
      'Pradhan Mantri Vidya Lakshmi Scheme',
      'Post Matric Scholarship for SC/ST/OBC',
      'Merit-cum-Means Scholarship'
    ]
  },
  agriculture: {
    en: ['farmer', 'agriculture', 'crop', 'farming', 'kisan', 'farm', 'agricultural', 'seeds', 'fertilizer', 'irrigation'],
    hi: ['किसान', 'कृषि', 'फसल', 'खेती', 'बीज', 'खाद', 'सिंचाई', 'कृषक'],
    schemes: [
      'PM-Kisan Samman Nidhi',
      'Kisan Credit Card',
      'Pradhan Mantri Fasal Bima Yojana',
      'Soil Health Card Scheme',
      'PM Kisan Maan Dhan Yojana'
    ]
  },
  women: {
    en: ['woman', 'women', 'mother', 'widow', 'girl', 'female', 'maternity', 'pregnancy'],
    hi: ['महिला', 'औरत', 'माता', 'विधवा', 'लड़की', 'गर्भावस्था', 'मातृत्व'],
    schemes: [
      'Pradhan Mantri Matru Vandana Yojana',
      'Beti Bachao Beti Padhao',
      'Sukanya Samriddhi Yojana',
      'Mahila Shakti Kendra',
      'National Widow Pension Scheme'
    ]
  },
  health: {
    en: ['health', 'medical', 'hospital', 'treatment', 'medicine', 'insurance', 'healthcare', 'doctor'],
    hi: ['स्वास्थ्य', 'चिकित्सा', 'अस्पताल', 'इलाज', 'दवा', 'बीमा', 'डॉक्टर'],
    schemes: [
      'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana',
      'Rashtriya Swasthya Bima Yojana',
      'Janani Suraksha Yojana',
      'National Health Mission'
    ]
  },
  employment: {
    en: ['job', 'employment', 'work', 'unemployed', 'skill', 'training', 'livelihood', 'wage', 'income'],
    hi: ['नौकरी', 'रोजगार', 'काम', 'बेरोजगार', 'कौशल', 'प्रशिक्षण', 'आजीविका', 'मजदूरी', 'आय'],
    schemes: [
      'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)',
      'Pradhan Mantri Rojgar Protsahan Yojana',
      'Deen Dayal Upadhyaya Grameen Kaushalya Yojana',
      'Pradhan Mantri Kaushal Vikas Yojana',
      'Atmanirbhar Bharat Rojgar Yojana'
    ]
  },
  housing: {
    en: ['house', 'housing', 'home', 'shelter', 'construction', 'property', 'awas'],
    hi: ['घर', 'आवास', 'मकान', 'निर्माण', 'संपत्ति', 'आश्रय'],
    schemes: [
      'Pradhan Mantri Awas Yojana',
      'Indira Gandhi National Widow Pension Scheme',
      'Rural Housing - Pradhan Mantri Awas Yojana Gramin'
    ]
  },
  loan: {
    en: ['loan', 'credit', 'finance', 'money', 'bank', 'mudra', 'business', 'startup'],
    hi: ['ऋण', 'कर्ज', 'वित्त', 'पैसा', 'बैंक', 'मुद्रा', 'व्यापार', 'स्टार्टअप'],
    schemes: [
      'Pradhan Mantri Mudra Yojana',
      'Stand Up India Scheme',
      'Kisan Credit Card',
      'PM SVANidhi (Street Vendor Loan)',
      'Startup India Scheme'
    ]
  },
  senior: {
    en: ['old', 'senior', 'elderly', 'pension', 'retirement', 'aged'],
    hi: ['बुजुर्ग', 'वृद्ध', 'पेंशन', 'सेवानिवृत्त', 'बुढ़ापा'],
    schemes: [
      'Pradhan Mantri Vaya Vandana Yojana',
      'National Social Assistance Programme',
      'Indira Gandhi National Old Age Pension Scheme',
      'Senior Citizen Savings Scheme'
    ]
  }
};

// Function to identify relevant schemes based on keywords
const identifyRelevantSchemes = (query: string, lang: 'en' | 'hi'): string[] => {
  const queryLower = query.toLowerCase();
  const relevantSchemes: string[] = [];

  Object.entries(SCHEME_KEYWORDS).forEach(([category, data]) => {
    const keywords = data[lang] || data.en;
    const hasKeyword = keywords.some(keyword => 
      queryLower.includes(keyword.toLowerCase())
    );
    
    if (hasKeyword) {
      relevantSchemes.push(...data.schemes);
    }
  });

  return [...new Set(relevantSchemes)]; // Remove duplicates
};

// Function to detect if query is unclear or too generic
const isQueryUnclear = (query: string, lang: 'en' | 'hi'): boolean => {
  const queryLower = query.toLowerCase().trim();
  
  const unclearPatterns = {
    en: ['help', 'hi', 'hello', 'what', 'how', 'tell me', 'info', 'about', 'scheme', 'government'],
    hi: ['मदद', 'हैलो', 'नमस्ते', 'क्या', 'कैसे', 'बताइए', 'जानकारी', 'योजना', 'सरकार']
  };

  const patterns = unclearPatterns[lang] || unclearPatterns.en;
  const wordCount = queryLower.split(' ').length;
  
  // Query is unclear if it's too short or only contains generic words
  return wordCount <= 2 || patterns.every(pattern => 
    queryLower.includes(pattern) || queryLower === pattern
  );
};

const getSystemInstruction = (lang: 'en' | 'hi', relevantSchemes: string[] = [], isUnclear: boolean = false) => {
  const langInstruction = lang === 'hi' ? 
    'You MUST reply in conversational Hindi using Devanagari script. Do not use any English words except for official scheme names.' : 
    'You MUST reply in simple, conversational English.';

  const schemeContext = relevantSchemes.length > 0 ? 
    `\n\nRELEVANT SCHEMES TO FOCUS ON: ${relevantSchemes.join(', ')}. Prioritize these schemes in your response if they match the user's query.` : '';

  const unclearQueryGuidance = isUnclear ? 
    `\n\nThe user's query seems unclear or too generic. Please ask clarifying questions to better understand their needs. For example, ask about their category (student, farmer, woman, senior citizen, etc.) or what type of help they need (financial assistance, loan, scholarship, etc.).` : '';

  return `
You are 'Bharat Mitra', a humble, supportive AI assistant helping Indian citizens find relevant government schemes and scholarships.

IMPORTANT: ${langInstruction}

Your Personality:
- Humble and respectful
- Calm, friendly, and professional, like a knowledgeable government officer
- Patient and encouraging
- Always ready to help citizens understand their rights and benefits

Response Guidelines:
1. SIMPLE LANGUAGE: Use simple, conversational language. Avoid technical jargon and complex sentences.
2. NO MARKDOWN: Never use markdown formatting like bold, italics, or special characters. Use plain text only.
3. CLEAR STRUCTURE: Organize information clearly with:
   - Brief introduction
   - Main scheme details
   - Eligibility criteria
   - Required documents
   - Application process
   - Official website links

4. KEY DETAILS TO INCLUDE:
   - What is the benefit/amount?
   - Who can apply?
   - What documents are needed?
   - How to apply?
   - Official website for more information

5. HELPFUL EXAMPLES:
   - Use real examples where possible
   - Mention specific amounts, age limits, income criteria
   - Include application deadlines if known

6. PROFESSIONAL TONE: 
   - Do not give financial or legal advice
   - Stick to factual information about government schemes
   - Be encouraging and supportive

7. FALLBACK RESPONSES:
   - If unsure about specific details, guide user to official sources
   - If scheme information is outdated, mention checking official websites
   - Always be honest about limitations of your knowledge

${schemeContext}
${unclearQueryGuidance}

Remember: Your goal is to make government schemes accessible and understandable for all citizens, especially those from rural areas or with limited education.
`;
};

const getFallbackResponse = (lang: 'en' | 'hi'): string => {
  if (lang === 'hi') {
    return `मुझे खुशी होगी आपकी मदद करने में! मैं भारत सरकार की विभिन्न योजनाओं के बारे में जानकारी दे सकता हूं।

कृपया बताएं कि आप किस श्रेणी में आते हैं या आपको किस प्रकार की सहायता चाहिए:

• छात्र - छात्रवृत्ति और शिक्षा योजनाएं
• किसान - कृषि और फसल संबंधी योजनाएं  
• महिला - महिला कल्याण योजनाएं
• व्यापारी - व्यापार ऋण और मुद्रा योजनाएं
• बुजुर्ग - पेंशन और वृद्धावस्था योजनाएं
• स्वास्थ्य - चिकित्सा बीमा योजनाएं
• आवास - घर बनाने की योजनाएं
• रोजगार - नौकरी और कौशल विकास योजनाएं

आप अपनी जरूरत के अनुसार पूछ सकते हैं, जैसे "मुझे छात्रवृत्ति चाहिए" या "किसान लोन के लिए क्या करना होगा"।`;
  } else {
    return `I'm happy to help you! I can provide information about various Indian government schemes and benefits.

Please tell me which category applies to you or what type of assistance you need:

• Student - Scholarships and education schemes
• Farmer - Agriculture and crop-related schemes
• Woman - Women welfare schemes
• Business - Business loans and Mudra schemes
• Senior Citizen - Pension and elderly care schemes
• Health - Medical insurance schemes
• Housing - Home construction schemes
• Employment - Job and skill development schemes

You can ask specific questions like "I need a scholarship" or "What documents are needed for farmer loan?"

How can I assist you today?`;
  }
};

export const getSchemeAdvice = async (query: string, lang: 'en' | 'hi'): Promise<string> => {
  if (!ai) {
    const mockResponse = lang === 'hi'
      ? "यह एक मॉक प्रतिक्रिया है क्योंकि एपीआई कुंजी कॉन्फ़िगर नहीं है। वास्तविक परिदृश्य में, मैं आपके द्वारा मांगी गई योजना के बारे में विस्तृत जानकारी प्रदान करूंगा।"
      : "This is a mock response as the API key is not configured. In a real scenario, I would provide detailed information about the scheme you asked for.";
    return new Promise(resolve => setTimeout(() => resolve(mockResponse), 1000));
  }
  
  try {
    // Identify relevant schemes and check if query is unclear
    const relevantSchemes = identifyRelevantSchemes(query, lang);
    const isUnclear = isQueryUnclear(query, lang);
    
    // If query is too unclear, return fallback response
    if (isUnclear && relevantSchemes.length === 0) {
      return getFallbackResponse(lang);
    }
    
    // Try the newer API format first
    try {
      const model = ai.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        systemInstruction: getSystemInstruction(lang, relevantSchemes, isUnclear)
      });
      
      const response = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: query }]
        }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1000,
        }
      });
      
      let responseText = '';
      
      // Handle different response formats
      if (response.response?.text) {
        responseText = await response.response.text();
      } else if (response.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        responseText = response.response.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from new API');
      }
      
      // Clean up any markdown formatting
      const cleanedResponse = responseText
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold
        .replace(/\*(.*?)\*/g, '$1')      // Remove italics
        .replace(/__(.*?)__/g, '$1')      // Remove underline
        .replace(/`(.*?)`/g, '$1')        // Remove code formatting
        .replace(/#{1,6}\s/g, '')         // Remove headers
        .trim();
      
      return cleanedResponse;
      
    } catch (newApiError) {
      console.warn('New API format failed, trying legacy format:', newApiError);
      
      // Fallback to legacy API format
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: query,
        config: {
          systemInstruction: getSystemInstruction(lang, relevantSchemes, isUnclear),
          temperature: 0.3,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1000,
        }
      });
      
      let responseText = '';
      if (response.text) {
        responseText = response.text;
      } else if (response.response?.text) {
        responseText = response.response.text();
      } else {
        throw new Error('Invalid response format from legacy API');
      }
      
      // Clean up any markdown formatting
      const cleanedResponse = responseText
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold
        .replace(/\*(.*?)\*/g, '$1')      // Remove italics
        .replace(/__(.*?)__/g, '$1')      // Remove underline
        .replace(/`(.*?)`/g, '$1')        // Remove code formatting
        .replace(/#{1,6}\s/g, '')         // Remove headers
        .trim();
      
      return cleanedResponse;
    }
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // More specific error handling
    if (error.message?.includes('API key') || error.message?.includes('PERMISSION_DENIED')) {
      return lang === 'hi'
        ? "एपीआई कुंजी की समस्या है। कृपया व्यवस्थापक से संपर्क करें।"
        : "API key issue. Please contact the administrator.";
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return lang === 'hi'
        ? "सेवा की सीमा पार हो गई है। कृपया कुछ देर बाद कोशिश करें।"
        : "Service limit reached. Please try again later.";
    }
    
    if (error.message?.includes('INVALID_ARGUMENT') || error.message?.includes('model')) {
      return lang === 'hi'
        ? "मॉडल कॉन्फ़िगरेशन में समस्या है। कृपया व्यवस्थापक से संपर्क करें।"
        : "Model configuration issue. Please contact the administrator.";
    }
    
    const errorMessage = lang === 'hi'
      ? "माफ़ करें, मुझे अपनी जानकारी तक पहुंचने में कुछ समस्या हो रही है। कृपया कुछ देर बाद फिर कोशिश करें।"
      : "I'm sorry, I'm having trouble accessing my knowledge base right now. Please try again in a moment.";
    
    return errorMessage;
  }
};
