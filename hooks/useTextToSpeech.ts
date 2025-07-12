import { useState, useCallback, useEffect, useRef } from 'react';

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const togglePlayPause = useCallback((text: string, messageId: string, lang: 'en' | 'hi') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.error('Text-to-speech is not supported in this browser.');
      return;
    }

    // If we're trying to play the currently active and playing message, pause it.
    if (isPlaying && !isPaused && activeMessageId === messageId) {
        window.speechSynthesis.pause();
        setIsPaused(true);
        return;
    }

    // If we're trying to play the currently paused message, resume it.
    if (isPlaying && isPaused && activeMessageId === messageId) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        return;
    }
    
    // If there's any speech, cancel it before starting new speech.
    if(window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language based on the parameter
    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }
    
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to find and set a specific voice for the language
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
    
    if (lang === 'hi') {
      // Look for Hindi voices
      const hindiVoice = voices.find(voice => 
        voice.lang.includes('hi') || 
        voice.lang.includes('Hindi') ||
        voice.name.toLowerCase().includes('hindi')
      );
      
      if (hindiVoice) {
        utterance.voice = hindiVoice;
        console.log('Using Hindi voice:', hindiVoice.name);
      } else {
        console.log('No Hindi voice found, using default with hi-IN lang');
      }
    } else {
      // Look for English (India) voices
      const englishIndiaVoice = voices.find(voice => 
        voice.lang === 'en-IN' || 
        (voice.lang.includes('en') && voice.name.toLowerCase().includes('india'))
      );
      
      if (englishIndiaVoice) {
        utterance.voice = englishIndiaVoice;
        console.log('Using English (India) voice:', englishIndiaVoice.name);
      } else {
        // Fallback to any English voice
        const englishVoice = voices.find(voice => voice.lang.includes('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
          console.log('Using English voice:', englishVoice.name);
        }
      }
    }
    
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      console.log('Speech started for language:', lang, 'with voice:', utterance.voice?.name || 'default');
      setIsPlaying(true);
      setIsPaused(false);
      setActiveMessageId(messageId);
    };

    utterance.onend = () => {
      console.log('Speech ended');
      setIsPlaying(false);
      setIsPaused(false);
      setActiveMessageId(null);
      utteranceRef.current = null;
    };
    
    utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        setIsPlaying(false);
        setIsPaused(false);
        setActiveMessageId(null);
        utteranceRef.current = null;
    };
    
    // Small delay to ensure voices are loaded
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
    
  }, [isPlaying, isPaused, activeMessageId]);
  
  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setActiveMessageId(null);
    }
  }, []);

  // Load voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log('Voices loaded:', voices.length);
    };

    if (window.speechSynthesis) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { isPlaying, isPaused, activeMessageId, togglePlayPause, cancel };
};
