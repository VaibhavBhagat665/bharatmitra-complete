import React, { createContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { UserProfile } from '../types';


export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserProfile;
            setUserData(userData);
          } else {
            console.warn('User document not found in Firestore');
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, data);
      
      // Update local state
      if (userData) {
        setUserData({ ...userData, ...data });
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const value: UserContextType = {
    user,
    userData,
    loading,
    updateUserProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
const generateUserId = () => `user_${Math.random().toString(36).substr(2, 9)}`;

interface UserContextType {
  userId: string;
  tokenBalance: number;
  addTokens: (amount: number) => void;
  deductTokens: (amount: number) => boolean;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  togglePlayPause: (text: string, id: string, lang: 'en' | 'hi') => void;
  stopSpeech: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  activeUtteranceId: string | null;
  user: User | null;
  userData: UserProfile | null;
  loading: boolean;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
  userId: '',
  tokenBalance: 0,
  addTokens: () => {},
  deductTokens: () => false,
  language: 'en',
  setLanguage: () => {},
  togglePlayPause: () => {},
  stopSpeech: () => {},
  isSpeaking: false,
  isPaused: false,
  activeUtteranceId: null,
  user: null,
  userData: null,
  loading: true,
  updateUserProfile: async () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userId] = useState<string>(generateUserId());
  const [tokenBalance, setTokenBalance] = useState<number>(100);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeUtteranceId, setActiveUtteranceId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const isProcessingRef = useRef(false);

  const getIndianMaleVoice = useCallback((lang: 'en' | 'hi') => {
    const availableVoices = voices.filter(voice => {
      const name = voice.name.toLowerCase();
      const voiceLang = voice.lang.toLowerCase();
      
      const isIndianMale = (
        name.includes('male') || 
        name.includes('man') || 
        (!name.includes('female') && !name.includes('woman'))
      );
      
      if (lang === 'hi') {
        return (
          isIndianMale && (
            voiceLang.startsWith('hi') || 
            voiceLang === 'en-in' ||
            name.includes('indian')
          )
        );
      } else {
        return (
          isIndianMale && (
            voiceLang === 'en-in' || 
            voiceLang.startsWith('en-') ||
            name.includes('indian')
          )
        );
      }
    });

    if (availableVoices.length === 0) {
      const maleVoices = voices.filter(voice => {
        const name = voice.name.toLowerCase();
        return (
          !name.includes('female') && 
          !name.includes('woman') &&
          (lang === 'hi' ? voice.lang.startsWith('hi') || voice.lang.startsWith('en-') : voice.lang.startsWith('en-'))
        );
      });
      return maleVoices[0] || null;
    }

    const preferredVoice = availableVoices.find(voice => {
      const name = voice.name.toLowerCase();
      return (
        name.includes('google') || 
        name.includes('microsoft') || 
        name.includes('premium') ||
        name.includes('neural')
      );
    });

    return preferredVoice || availableVoices[0] || null;
  }, [voices]);

  useEffect(() => {
    const loadVoices = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      console.log('Available voices:', loadedVoices.map(v => ({ name: v.name, lang: v.lang })));
      setVoices(loadedVoices);
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
    };
  }, []);

  const detectLanguage = useCallback((text: string): 'en' | 'hi' => {
    const hindiPattern = /[\u0900-\u097F]/;
    const hindiCharCount = (text.match(/[\u0900-\u097F]/g) || []).length;
    const totalChars = text.replace(/\s/g, '').length;
    
    return hindiCharCount / totalChars > 0.2 ? 'hi' : 'en';
  }, []);

  const cleanTextForTTS = useCallback((text: string): string => {
    const phrasesToRemove = [
      /here\s+is\s+your\s+answer[:\s]*/gi,
      /here's\s+your\s+answer[:\s]*/gi,
      /your\s+answer\s+is[:\s]*/gi,
      /the\s+answer\s+is[:\s]*/gi,
      /here\s+is\s+the\s+answer\s+to\s+your\s+question[:\s.]*/gi,
      /hello[,\s]*i\s+am\s+bharat\s+mitra[,\s.]*/gi,
      /hi[,\s]*i'm\s+bharat\s+mitra[,\s.]*/gi,
      /greetings[,\s]*i\s+am\s+bharat\s+mitra[,\s.]*/gi,
      /namaste[,\s]*i\s+am\s+bharat\s+mitra[,\s.]*/gi,
      /i\s+am\s+bharat\s+mitra[,\s.]*/gi,
      /thank\s+you\s+for\s+asking[,\s.]*/gi,
      /thank\s+you\s+for\s+your\s+question[,\s.]*/gi,
      /that's\s+a\s+great\s+question[,\s.]*/gi,
      /let\s+me\s+help\s+you[,\s.]*/gi,
      /sure[,\s]*here\s+is[,\s.]*/gi,
      /of\s+course[,\s.]*/gi,
      /absolutely[,\s.]*/gi,
      /certainly[,\s.]*/gi,
      
      /धन्यवाद\s+पूछने\s+के\s+लिए[,\s.]*/gi,
      /आपका\s+स्वागत\s+है[,\s.]*/gi,
      /यहाँ\s+आपके\s+सवाल\s+का\s+जवाब\s+है[:\s.]*/gi,
      /आपके\s+प्रश्न\s+का\s+उत्तर\s+यहाँ\s+है[:\s.]*/gi,
      /नमस्ते[,\s]*मैं\s+भारत\s+मित्र\s+हूँ[,\s.]*/gi,
      /मैं\s+भारत\s+मित्र\s+हूँ[,\s.]*/gi,
      
      /\*\*[^*]*\*\*/g,
      /\*[^*]*\*/g,
      /#{1,6}\s/g,
      /```[\s\S]*?```/g,
      /`[^`]*`/g,
      /\[[^\]]*\]\([^)]*\)/g,
    ];

    let cleanedText = text;
    
    phrasesToRemove.forEach(pattern => {
      cleanedText = cleanedText.replace(pattern, '');
    });

    cleanedText = cleanedText
      .replace(/\s+/g, ' ')
      .replace(/^\s*[,.\-:;।]\s*/, '')
      .replace(/\s*[,.\-:;।]\s*$/, '')
      .replace(/^[.\s]+/, '')
      .trim();

    return cleanedText;
  }, []);

  const stopSpeech = useCallback(() => {
    const synth = window.speechSynthesis;
    if (synth.speaking || synth.pending) {
      synth.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveUtteranceId(null);
    utteranceRef.current = null;
    isProcessingRef.current = false;
  }, []);

  const togglePlayPause = useCallback((text: string, id: string, contextLang: 'en' | 'hi') => {
    if (isProcessingRef.current) {
      console.log('Already processing, ignoring call');
      return;
    }
    
    isProcessingRef.current = true;
    const synth = window.speechSynthesis;
    const isThisMessageActive = id === activeUtteranceId;

    try {
      if (synth.speaking && isThisMessageActive && utteranceRef.current) {
        if (synth.paused) {
          synth.resume();
          setIsPaused(false);
        } else {
          synth.pause();
          setIsPaused(true);
        }
        isProcessingRef.current = false;
        return;
      }

      if (synth.speaking || synth.pending) {
        synth.cancel();
      }

      const cleanedText = cleanTextForTTS(text);
      
      if (!cleanedText.trim()) {
        console.warn('No content to speak after cleaning');
        isProcessingRef.current = false;
        return;
      }

      const detectedLang = detectLanguage(cleanedText);
      
      const voiceLang = contextLang === 'hi' ? 'hi' : detectedLang;

      console.log(`Speaking in ${voiceLang} (context: ${contextLang}, detected: ${detectedLang}):`, cleanedText.substring(0, 100) + '...');

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utteranceRef.current = utterance;

      const voice = getIndianMaleVoice(voiceLang);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
        console.log(`Selected voice: ${voice.name} (${voice.lang})`);
      } else {
        utterance.lang = voiceLang === 'hi' ? 'hi-IN' : 'en-IN';
        console.log(`No specific voice found, using lang: ${utterance.lang}`);
      }
      
      utterance.rate = 0.85; 
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.log('Speech started for:', id);
        setIsSpeaking(true);
        setIsPaused(false);
        setActiveUtteranceId(id);
        isProcessingRef.current = false;
      };
      
      utterance.onpause = () => {
        console.log('Speech paused');
        setIsPaused(true);
      };
      
      utterance.onresume = () => {
        console.log('Speech resumed');
        setIsPaused(false);
      };
      
      utterance.onend = () => {
        console.log('Speech ended for:', id);
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveUtteranceId(null);
        utteranceRef.current = null;
        isProcessingRef.current = false;
      };
      
      utterance.onerror = (e) => {
        console.error("SpeechSynthesis Error:", e);
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveUtteranceId(null);
        utteranceRef.current = null;
        isProcessingRef.current = false;
      };
      
      setTimeout(() => {
        if (utteranceRef.current === utterance && !synth.speaking) {
          synth.speak(utterance);
        } else {
          isProcessingRef.current = false;
        }
      }, 100);

    } catch (error) {
      console.error('Error in togglePlayPause:', error);
      isProcessingRef.current = false;
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveUtteranceId(null);
    }
  }, [activeUtteranceId, getIndianMaleVoice, cleanTextForTTS, detectLanguage]);
  
  useEffect(() => {
    stopSpeech();
  }, [language, stopSpeech]);

  const addTokens = (amount: number) => {
    setTokenBalance(prevBalance => prevBalance + amount);
  };

  const deductTokens = (amount: number): boolean => {
    if (tokenBalance >= amount) {
      setTokenBalance(prevBalance => prevBalance - amount);
      return true;
    }
    return false;
  };

  const value = {
    userId,
    tokenBalance,
    addTokens,
    deductTokens,
    language,
    setLanguage,
    togglePlayPause,
    stopSpeech,
    isSpeaking,
    isPaused,
    activeUtteranceId,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
