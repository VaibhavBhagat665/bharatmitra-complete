import { useState, useEffect, useRef, useCallback } from 'react';

// Type definitions for the Web Speech API to resolve TypeScript errors.
// These are based on the standard API and provide type safety.
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

// Extend the window object with SpeechRecognition APIs
declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

// Polyfill for browsers that have webkitSpeechRecognition but not SpeechRecognition
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechRecognition = (lang: 'en' | 'hi') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const listeningIntentRef = useRef(false);
  
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      console.warn('Speech Recognition is not supported in this browser.');
      setError('Speech Recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onend = () => {
      if (listeningIntentRef.current) {
        try {
          recognition.start();
        } catch (err) {
          console.error("Failed to restart speech recognition", err);
          listeningIntentRef.current = false;
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Suppress logging for non-critical, expected errors to keep the console clean.
        // The onend handler will automatically restart recognition if the user intended to keep listening.
        if (event.error === 'no-speech' || event.error === 'aborted') {
            setError(null);
            return;
        }
        
        // Log only critical, unexpected errors.
        console.error('Speech recognition error:', event.error, event.message);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError('Permission denied. Please allow microphone access in your browser settings.');
          listeningIntentRef.current = false;
        } else {
          setError(`An error occurred: ${event.error}`);
          listeningIntentRef.current = false;
        }
    };

    return () => {
      listeningIntentRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
      }
    };
  }, []);
  
  // Update lang whenever it changes
  useEffect(() => {
      if(recognitionRef.current){
          recognitionRef.current.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
      }
  }, [lang]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      setError(null);
      setTranscript('');
      finalTranscriptRef.current = '';
      
      listeningIntentRef.current = true;
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      listeningIntentRef.current = false;
      recognitionRef.current.stop();
    }
  }, []);

  return { isListening, transcript, startListening, stopListening, error };
};