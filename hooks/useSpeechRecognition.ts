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

// Utility function to detect language from text
const detectLanguage = (text: string): 'en' | 'hi' => {
    const hindiRegex = /[\u0900-\u097F]/;
    return hindiRegex.test(text) ? 'hi' : 'en';
};

// Utility function to check if text is meaningful
const isMeaningfulText = (text: string): boolean => {
    const cleanText = text.trim();
    if (cleanText.length < 2) return false;
    
    // Filter out common noise words
    const noiseWords = ['uh', 'um', 'ah', 'hmm', 'hm'];
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
        setDetectedLanguage(detectedLang);
        setTranscript(finalText);
        setIsComplete(true);
        
        console.log('Final processed result:', finalText, 'Language:', detectedLang);
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
        
        // Configure recognition
        recognition.continuous = false; // Changed to false to prevent multiple results
        recognition.interimResults = true;
        recognition.lang = 'hi-IN'; // Start with Hindi as primary language
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
            // Check if this is still the active session
            if (sessionIdRef.current !== currentSessionId || !isActiveRef.current) {
                return;
            }

            let interimTranscript = '';
            let finalTranscript = '';

            // Process all results
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

            // Update display with current transcript
            const currentText = finalTranscript || interimTranscript;
            if (currentText.trim()) {
                setTranscript(currentText.trim());
                
                // Detect language from current text
                const detectedLang = detectLanguage(currentText);
                setDetectedLanguage(detectedLang);
            }

            // If we have a final result, process it
            if (finalTranscript.trim()) {
                console.log('Final result received:', finalTranscript);
                setTimeout(() => {
                    if (sessionIdRef.current === currentSessionId) {
                        processResult(finalTranscript.trim());
                        cleanup();
                    }
                }, 100);
            } else if (interimTranscript.trim()) {
                // Set a timeout for interim results
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
                }, 2000); // 2 second timeout
            }
        };

        recognition.onend = () => {
            console.log('Speech recognition ended - Session:', currentSessionId);
            
            if (sessionIdRef.current === currentSessionId) {
                // If we have a final result, process it
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
                    setError('माइक्रोफोन की अनुमति नहीं है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफोन की अनुमति दें।');
                    break;
                case 'network':
                    setError('नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।');
                    break;
                case 'audio-capture':
                    setError('माइक्रोफोन एक्सेस नहीं हो सका। कृपया माइक्रोफोन जांचें।');
                    break;
                case 'no-speech':
                    setError('कोई आवाज़ नहीं सुनाई दी। कृपया फिर से कोशिश करें।');
                    break;
                default:
                    setError(`त्रुटि: ${event.error}`);
            }
            
            cleanup();
        };

        // Start recognition
        try {
            recognition.start();
        } catch (err) {
            console.error('Failed to start recognition:', err);
            setError('स्पीच रिकग्निशन शुरू नहीं हो सका। कृपया फिर से कोशिश करें।');
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

    // Cleanup on unmount
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
