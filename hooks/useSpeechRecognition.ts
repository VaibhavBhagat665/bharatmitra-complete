import { useState, useEffect, useRef, useCallback } from 'react';

// Type definitions for the Web Speech API
interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

type SpeechRecognitionErrorCode =
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported';

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    start(): void;
    stop(): void;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

// Improved language detection function
const detectLanguage = (text: string): 'en' | 'hi' => {
    const cleanText = text.toLowerCase().trim();
    
    // Check for Devanagari script (Hindi)
    const devanagariRegex = /[\u0900-\u097F]/;
    if (devanagariRegex.test(text)) {
        return 'hi';
    }
    
    // Common Hindi words written in English (Hinglish)
    const hindiWords = [
        'kya', 'hai', 'hum', 'aap', 'yeh', 'woh', 'kaise', 'kahan', 'kab', 'kyun',
        'mera', 'tera', 'uska', 'hamara', 'tumhara', 'unka', 'main', 'tu', 'wo',
        'nahin', 'nahi', 'haan', 'ji', 'sahab', 'bhai', 'didi', 'uncle', 'aunty',
        'ghar', 'paisa', 'paise', 'rupee', 'rupaye', 'scheme', 'yojana', 'sarkar',
        'pradhan', 'mantri', 'modi', 'bharat', 'india', 'desh', 'gaon', 'shahar',
        'kisan', 'majdoor', 'vyavasaya', 'business', 'naukri', 'job', 'padhna',
        'likhna', 'samjhna', 'batana', 'puchna', 'kahna', 'sunna', 'dekhna',
        'achha', 'bura', 'sahi', 'galat', 'theek', 'dhanyawad', 'namaste'
    ];
    
    // Check for Hindi keywords
    const words = cleanText.split(/\s+/);
    const hindiWordsFound = words.filter(word => 
        hindiWords.some(hindiWord => word.includes(hindiWord))
    ).length;
    
    // If more than 30% words are Hindi-related, consider it Hindi
    if (hindiWordsFound > 0 && (hindiWordsFound / words.length) > 0.3) {
        return 'hi';
    }
    
    // Check for English patterns
    const englishWords = [
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our',
        'what', 'when', 'where', 'who', 'why', 'how', 'this', 'that', 'these', 'those', 'they', 'them',
        'have', 'has', 'will', 'would', 'could', 'should', 'shall', 'may', 'might', 'must',
        'government', 'scheme', 'application', 'benefit', 'eligibility', 'document', 'registration'
    ];
    
    const englishWordsFound = words.filter(word => 
        englishWords.includes(word)
    ).length;
    
    // If significant English words found, consider it English
    if (englishWordsFound > 0 && (englishWordsFound / words.length) > 0.2) {
        return 'en';
    }
    
    // Default fallback: if text length > 10 and contains more consonants typical of Hindi transliteration
    const hindiConsonants = ['dh', 'bh', 'gh', 'kh', 'ph', 'th', 'ch', 'jh', 'nh', 'sh'];
    const hindiConsonantCount = hindiConsonants.reduce((count, consonant) => 
        count + (cleanText.match(new RegExp(consonant, 'g')) || []).length, 0
    );
    
    if (hindiConsonantCount > 1) {
        return 'hi';
    }
    
    // Default to English if uncertain
    return 'en';
};

// Utility function to check if text is meaningful
const isMeaningfulText = (text: string): boolean => {
    const cleanText = text.trim();
    if (cleanText.length < 2) return false;
    
    // Filter out common noise words
    const noiseWords = ['uh', 'um', 'ah', 'hmm', 'hm', 'er', 'uhm'];
    const words = cleanText.toLowerCase().split(/\s+/);
    const meaningfulWords = words.filter(word => !noiseWords.includes(word));
    
    return meaningfulWords.length > 0 && meaningfulWords.join(' ').length >= 2;
};

export const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [detectedLanguage, setDetectedLanguage] = useState<'en' | 'hi'>('en');
    const [error, setError] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isActiveRef = useRef(false);
    const finalResultRef = useRef('');
    const sessionIdRef = useRef(0);

    const cleanup = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        
        if (recognitionRef.current && isActiveRef.current) {
            isActiveRef.current = false;
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // Ignore errors during cleanup
            }
        }
        
        setIsListening(false);
    }, []);

    const processResult = useCallback((finalText: string) => {
        if (!finalText.trim() || !isMeaningfulText(finalText)) {
            return;
        }

        const detectedLang = detectLanguage(finalText);
        console.log('Detected language for text:', finalText, '-> Language:', detectedLang);
        
        setDetectedLanguage(detectedLang);
        setTranscript(finalText);
        setIsComplete(true);
    }, []);

    const startListening = useCallback(() => {
        if (!SpeechRecognitionAPI) {
            setError('Speech Recognition is not supported in this browser.');
            return;
        }

        if (isActiveRef.current) {
            cleanup();
            return;
        }

        // Stop any ongoing speech synthesis
        if (window.speechSynthesis?.speaking) {
            window.speechSynthesis.cancel();
        }

        // Create new session
        sessionIdRef.current += 1;
        const currentSessionId = sessionIdRef.current;

        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;
        
        // Configure recognition - use auto language detection
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Use English-India as base, it often picks up Hindi too
        recognition.maxAlternatives = 1;

        // Reset state
        setError(null);
        setTranscript('');
        setIsComplete(false);
        finalResultRef.current = '';
        isActiveRef.current = true;
        setIsListening(true);

        recognition.onstart = () => {
            console.log('Speech recognition started - Session:', currentSessionId);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            if (sessionIdRef.current !== currentSessionId || !isActiveRef.current) {
                return;
            }

            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript;

                if (result.isFinal) {
                    finalTranscript = transcript;
                    finalResultRef.current = transcript;
                } else {
                    interimTranscript = transcript;
                }
            }

            const currentText = finalTranscript || interimTranscript;
            if (currentText.trim()) {
                setTranscript(currentText.trim());
                
                // Update language detection in real-time
                const detectedLang = detectLanguage(currentText);
                setDetectedLanguage(detectedLang);
            }

            if (finalTranscript.trim()) {
                console.log('Final result received:', finalTranscript);
                setTimeout(() => {
                    if (sessionIdRef.current === currentSessionId) {
                        processResult(finalTranscript.trim());
                        cleanup();
                    }
                }, 100);
            } else if (interimTranscript.trim()) {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                
                timeoutRef.current = setTimeout(() => {
                    if (sessionIdRef.current === currentSessionId && isActiveRef.current) {
                        const currentResult = interimTranscript.trim();
                        if (currentResult && isMeaningfulText(currentResult)) {
                            console.log('Processing interim result due to timeout:', currentResult);
                            processResult(currentResult);
                        }
                        cleanup();
                    }
                }, 2000);
            }
        };

        recognition.onend = () => {
            console.log('Speech recognition ended - Session:', currentSessionId);
            
            if (sessionIdRef.current === currentSessionId) {
                if (finalResultRef.current.trim()) {
                    processResult(finalResultRef.current.trim());
                }
                
                setIsListening(false);
                isActiveRef.current = false;
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error, event.message);
            
            if (sessionIdRef.current !== currentSessionId) {
                return;
            }

            switch (event.error) {
                case 'not-allowed':
                case 'service-not-allowed':
                    setError('Microphone permission denied. Please allow microphone access.');
                    break;
                case 'network':
                    setError('Network error. Please check your connection.');
                    break;
                case 'audio-capture':
                    setError('Could not access microphone. Please check your microphone.');
                    break;
                case 'no-speech':
                    setError('No speech detected. Please try again.');
                    break;
                default:
                    setError(`Error: ${event.error}`);
            }
            
            cleanup();
        };

        try {
            recognition.start();
        } catch (err) {
            console.error('Failed to start recognition:', err);
            setError('Could not start speech recognition. Please try again.');
            cleanup();
        }
    }, [cleanup, processResult]);

    const stopListening = useCallback(() => {
        cleanup();
    }, [cleanup]);

    const resetSession = useCallback(() => {
        setTranscript('');
        setIsComplete(false);
        setError(null);
        finalResultRef.current = '';
    }, []);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        isListening,
        transcript,
        detectedLanguage,
        error,
        isComplete,
        startListening,
        stopListening,
        resetSession
    };
};
