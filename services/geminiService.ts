const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://bharatmitra-complete-1.onrender.com';

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
  },
  environment: {
    en: ['environment', 'forest', 'forestry', 'green', 'sustainable', 'sustainability', 'climate', 'renewable', 'solar', 'wind'],
    hi: ['पर्यावरण', 'वन', 'हरित', 'सतत', 'जलवायु', 'नवीकरणीय', 'सौर', 'पवन'],
    schemes: [
      'National Mission for a Green India',
      'Compensatory Afforestation Fund (CAMPA)',
      'PM-KUSUM (Solar)',
      'National Afforestation Programme'
    ]
  }
};

const detectCategories = (query: string, lang: 'en' | 'hi'): string[] => {
  const q = query.toLowerCase();
  const cats: string[] = [];
  Object.entries(SCHEME_KEYWORDS).forEach(([cat, data]: any) => {
    const keywords = data[lang] || data.en;
    if (keywords.some((kw: string) => q.includes(kw.toLowerCase()))) cats.push(cat);
  });
  return [...new Set(cats)];
};

const getReferenceUrls = (query: string, lang: 'en' | 'hi'): string[] => {
  const categories = detectCategories(query, lang);
  const urls: string[] = [];
  urls.push(`https://www.myscheme.gov.in/search?query=${encodeURIComponent(query)}`);
  const add = (...u: string[]) => u.forEach(x => { if (x && !urls.includes(x)) urls.push(x); });
  if (categories.includes('education')) add('https://scholarships.gov.in/', 'https://www.vidyalakshmi.co.in/Students/');
  if (categories.includes('agriculture')) add('https://pmkisan.gov.in/', 'https://pmfby.gov.in/');
  if (categories.includes('women')) add('https://wcd.nic.in/', 'https://wcd.nic.in/bbbp-scheme');
  if (categories.includes('health')) add('https://pmjay.gov.in/', 'https://nhp.gov.in/');
  if (categories.includes('employment')) add('https://nrega.nic.in/', 'https://www.pmkvyofficial.org/');
  if (categories.includes('housing')) add('https://pmay-urban.gov.in/', 'https://pmayg.nic.in/');
  if (categories.includes('loan')) add('https://www.mudra.org.in/', 'https://www.standupmitra.in/');
  if (categories.includes('senior')) add('https://nsap.nic.in/');
  if (categories.includes('environment')) add('https://moef.gov.in/', 'https://parivesh.nic.in/');
  return urls.slice(0, 3);
};

// Function to identify relevant schemes based on keywords
const identifyRelevantSchemes = (query: string, lang: 'en' | 'hi'): string[] => {
  const queryLower = query.toLowerCase();
  const relevantSchemes: string[] = [];

  Object.entries(SCHEME_KEYWORDS).forEach(([_, data]) => {
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
  try {
    const relevantSchemes = identifyRelevantSchemes(query, lang);
    // const isUnclear = isQueryUnclear(query, lang);
    // if (isUnclear && relevantSchemes.length === 0) {
    //   return getFallbackResponse(lang);
    // }
    const isUnclear = false; // Bypass client-side check

    const body = {
      query,
      lang,
      system_instruction: getSystemInstruction(lang, relevantSchemes, isUnclear)
      // urls removed; backend now handles searching via Puppeteer
    };

    const endpoint = `${BASE_URL}/api/llm/answer`;
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      if (r.status === 503) {
        return lang === 'hi'
          ? 'मॉडल लोड हो रहा है। कृपया कुछ देर बाद फिर कोशिश करें।'
          : 'Model is loading. Please try again shortly.';
      }
      return getFallbackResponse(lang);
    }
    const data = await r.json();
    const text = (data && typeof data.text === 'string') ? data.text : '';
    return text && text.trim().length > 0 ? text : getFallbackResponse(lang);
  } catch (error) {
    console.error("API Call Failed:", error);
    return getFallbackResponse(lang);
  }
};
