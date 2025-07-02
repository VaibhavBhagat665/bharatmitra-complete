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
    // Simple heuristic: if text contains Hindi characters, it's Hindi
    const hindiRegex = /[\u0900-\u097F]/;
    return hindiRegex.test(text) ? 'hi' : 'en';
};

// Utility function to check if text is meaningful (not just noise)
const isMeaningfulText = (text: string): boolean => {
    const cleanText = text.trim().toLowerCase();
    if (cleanText.length < 2) return false;
    
    // Filter out common false positives and noise
    const noiseWords = ['uh', 'um', 'ah', 'hmm', 'hm', 'ok', 'okay'];
    const isOnlyNoise = noiseWords.includes(cleanText);
    
    return !isOnlyNoise;
};

export const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [detectedLanguage, setDetectedLanguage] = useState<'en' | 'hi'>('en');
    const [error, setError] = useState<string | null>(null);
    const [isProcessingComplete, setIsProcessingComplete] = useState(false);
    
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const finalTranscriptRef = useRef('');
    const isActiveSessionRef = useRef(false);
    const lastProcessedTranscriptRef = useRef('');
    
    // Configuration
    const SILENCE_TIMEOUT = 2000; // 2 seconds of silence before stopping
    const MIN_SPEECH_LENGTH = 3; // Minimum characters for valid speech

    const clearSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    }, []);

    const startSilenceTimer = useCallback(() => {
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(() => {
            if (isActiveSessionRef.current && recognitionRef.current) {
                stopListening();
            }
        }, SILENCE_TIMEOUT);
    }, []);

    const initializeRecognition = useCallback(() => {
        if (!SpeechRecognitionAPI) {
            setError('Speech Recognition is not supported in this browser.');
            return null;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Start with English, will auto-detect later
        
        recognition.onstart = () => {
            console.log('Speech recognition started');
            setError(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            if (!isActiveSessionRef.current) return;

            let interimTranscript = '';
            let finalTranscript = finalTranscriptRef.current;

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const result = event.results[i];
                const transcript = result[0].transcript;

                if (result.isFinal) {
                    finalTranscript += transcript;
                    finalTranscriptRef.current = finalTranscript;
                } else {
                    interimTranscript += transcript;
                }
            }

            const currentTranscript = finalTranscript + interimTranscript;
            setTranscript(currentTranscript);

            // Auto-detect language from the speech
            if (currentTranscript.trim()) {
                const detectedLang = detectLanguage(currentTranscript);
                setDetectedLanguage(detectedLang);
                
                // Update recognition language if different
                if (recognition.lang !== (detectedLang === 'hi' ? 'hi-IN' : 'en-IN')) {
                    recognition.lang = detectedLang === 'hi' ? 'hi-IN' : 'en-IN';
                }
            }

            // Reset silence timer on new speech
            if (interimTranscript.trim()) {
                clearSilenceTimer();
            } else if (finalTranscript.trim()) {
                // Start silence timer after final result
                startSilenceTimer();
            }
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
            if (isActiveSessionRef.current) {
                // Check if we have meaningful final transcript
                const finalText = finalTranscriptRef.current.trim();
                if (finalText && 
                    isMeaningfulText(finalText) && 
                    finalText !== lastProcessedTranscriptRef.current &&
                    finalText.length >= MIN_SPEECH_LENGTH) {
                    
                    lastProcessedTranscriptRef.current = finalText;
                    setIsProcessingComplete(true);
                }
            }
            
            // Clean up
            isActiveSessionRef.current = false;
            setIsListening(false);
            clearSilenceTimer();
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            
            // Handle different types of errors
            switch (event.error) {
                case 'not-allowed':
                case 'service-not-allowed':
                    setError('Microphone permission denied. Please allow microphone access.');
                    break;
                case 'network':
                    setError('Network error. Please check your connection.');
                    break;
                case 'no-speech':
                    // Don't show error for no speech, just stop gracefully
                    break;
                case 'aborted':
                    // Don't show error for manual abort
                    break;
                default:
                    setError(`Speech recognition error: ${event.error}`);
            }
            
            // Clean up on error
            isActiveSessionRef.current = false;
            setIsListening(false);
            clearSilenceTimer();
        };

        return recognition;
    }, [clearSilenceTimer, startSilenceTimer]);

    const startListening = useCallback(() => {
        if (isActiveSessionRef.current) return; // Prevent multiple starts

        // Stop any ongoing speech synthesis
        if (window.speechSynthesis?.speaking) {
            window.speechSynthesis.cancel();
        }

        const recognition = initializeRecognition();
        if (!recognition) return;

        recognitionRef.current = recognition;
        
        // Reset state
        setError(null);
        setTranscript('');
        setIsProcessingComplete(false);
        finalTranscriptRef.current = '';
        isActiveSessionRef.current = true;
        
        try {
            recognition.start();
            setIsListening(true);
        } catch (err) {
            console.error('Failed to start speech recognition:', err);
            setError('Failed to start speech recognition. Please try again.');
            isActiveSessionRef.current = false;
        }
    }, [initializeRecognition]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isActiveSessionRef.current) {
            isActiveSessionRef.current = false;
            recognitionRef.current.stop();
        }
        clearSilenceTimer();
    }, [clearSilenceTimer]);

    const resetSession = useCallback(() => {
        setTranscript('');
        setIsProcessingComplete(false);
        setError(null);
        finalTranscriptRef.current = '';
        lastProcessedTranscriptRef.current = '';
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                isActiveSessionRef.current = false;
                recognitionRef.current.stop();
            }
            clearSilenceTimer();
        };
    }, [clearSilenceTimer]);

    return {
        isListening,
        transcript,
        detectedLanguage,
        error,
        isProcessingComplete,
        startListening,
        stopListening,
        resetSession
    };
};
