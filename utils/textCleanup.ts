export const cleanTextForSpeech = (text: string): string => {
  if (!text) return '';
  
  let cleanedText = text;
  
  cleanedText = cleanedText
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')  
    .replace(/\*\*(.*?)\*\*/g, '$1')      
    .replace(/\*(.*?)\*/g, '$1')          
    .replace(/__(.*?)__/g, '$1')          
    .replace(/_(.*?)_/g, '$1')           
    
    .replace(/~~(.*?)~~/g, '$1')
    
    .replace(/`{3}[\s\S]*?`{3}/g, 'code block')  
    .replace(/`(.*?)`/g, '$1')                  
    
    .replace(/^#{1,6}\s+/gm, '')
    
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')     
    .replace(/\[([^\]]+)\]\[[^\]]+\]/g, '$1')    
    
    .replace(/<[^>]*>/g, '')
    
    .replace(/^\s*[-*+]\s+/gm, '')             
    .replace(/^\s*\d+\.\s+/gm, '')             
    
    .replace(/^\s*>\s+/gm, '')
    
    .replace(/^[-*_]{3,}$/gm, '')
    
    .replace(/\n{3,}/g, '\n\n')                  
    .replace(/[ \t]{2,}/g, ' ')                 
    .trim();
  
  return cleanedText;
};

export const cleanTextForDisplay = (text: string): string => {
  if (!text) return '';
  
  let cleanedText = text;
  
  cleanedText = cleanedText
    .replace(/\*{4,}/g, '')                    
    .replace(/\*\*\*\*([^*]+)\*\*\*\*/g, '**$1**')  
    
    .replace(/\*\s+([^*\n]+)\s+\*/g, '*$1*')     
    .replace(/\*\*\s+([^*\n]+)\s+\*\*/g, '**$1**') 
    
    .replace(/^\*+$/gm, '')
    .replace(/\s\*+\s/g, ' ')
    
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
  
  return cleanedText;
};

export const cleanVoiceResponse = (text: string, language: 'en' | 'hi' = 'en'): string => {
  let cleaned = cleanTextForSpeech(text);
  
  if (language === 'hi') {
    cleaned = cleaned
      .replace(/\b(bold|italic|underline|strikethrough)\b/gi, '')
      .replace(/\b(heading|title|subtitle)\b/gi, '');
  }
  
  cleaned = cleaned
    .replace(/^(Here's|Here is|Sure,|Certainly,|Of course,)\s*/i, '')
    .replace(/\b(Note:|Important:|Tip:|Warning:)\s*/gi, '')
    .replace(/\(Note:.*?\)/gi, '')
    .replace(/\[.*?\]/g, '')                    
    .replace(/\{.*?\}/g, '')                     
    
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/www\.[^\s]+/g, '')
    
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned;
};
