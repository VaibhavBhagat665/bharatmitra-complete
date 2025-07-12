import { useState, useCallback, useEffect, useRef } from 'react';

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  const loadVoices = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    setAvailableVoices(voices);
    console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
  }, []);

  useEffect(() => {
    loadVoices();
    // Listen for voices changed event (some browsers load voices asynchronously)
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [loadVoices]);

  // Function to find the best voice for a given language
  const findBestVoice = useCallback((lang: 'en' | 'hi'): SpeechSynthesisVoice | null => {
    if (availableVoices.length === 0) {
      console.warn('No voices available yet');
      return null;
    }

    console.log(`Finding best voice for language: ${lang}`);
    
    if (lang === 'hi') {
      // Priority order for Hindi voices
      const hindiVoicePreferences = [
        'hi-IN', 'hi', 'Hindi', 'Google हिन्दी', 'Microsoft Heera',
        'Lekha', 'Neerja', 'Hemant', 'Kalpana'
      ];
      
      // First try to find exact Hindi voices
      for (const preference of hindiVoicePreferences) {
        const voice = availableVoices.find(v => 
          v.lang.toLowerCase().includes('hi') || 
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes(preference.toLowerCase())
        );
        if (voice) {
          console.log(`Selected Hindi voice: ${voice.name} (${voice.lang})`);
          return voice;
        }
      }
      
      // Fallback to any voice that might work with Hindi
      const fallbackVoice = availableVoices.find(v => 
        v.lang.includes('IN') || v.name.includes('Indian')
      );
      if (fallbackVoice) {
        console.log(`Selected fallback Hindi voice: ${fallbackVoice.name} (${fallbackVoice.lang})`);
        return fallbackVoice;
      }
    } else {
      // Priority order for English voices (preferring Indian English)
      const englishVoicePreferences = [
        'en-IN', 'en-US', 'en-GB', 'en-AU', 'Google US English',
        'Microsoft David', 'Microsoft Zira', 'Alex', 'Samantha'
      ];
      
      // First try to find Indian English voices
      for (const preference of englishVoicePreferences) {
        const voice = availableVoices.find(v => 
          v.lang.toLowerCase().includes(preference.toLowerCase()) ||
          v.name.toLowerCase().includes(preference.toLowerCase())
        );
        if (voice) {
          console.log(`Selected English voice: ${voice.name} (${voice.lang})`);
          return voice;
        }
      }
      
      // Fallback to any English voice
      const fallbackVoice = availableVoices.find(v => 
        v.lang.toLowerCase().includes('en')
      );
      if (fallbackVoice) {
        console.log(`Selected fallback English voice: ${fallbackVoice.name} (${fallbackVoice.lang})`);
        return fallbackVoice;
      }
    }

    console.warn(`No suitable voice found for language: ${lang}`);
    return null;
  }, [availableVoices]);

  const togglePlayPause = useCallback((text: string, messageId: string, lang: 'en' | 'hi') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.error('Text-to-speech is not supported in this browser.');
      return;
    }

    console.log(`TTS request: lang=${lang}, messageId=${messageId}, text="${text.substring(0, 50)}..."`);

    // If we're trying to play the currently active and playing message, pause it.
    if (isPlaying && !isPaused && activeMessageId === messageId) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      console.log('TTS paused');
      return;
    }

    // If we're trying to play the currently paused message, resume it.
    if (isPlaying && isPaused && activeMessageId === messageId) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      console.log('TTS resumed');
      return;
    }
    
    // If there's any speech, cancel it before starting new speech.
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      console.log('Previous TTS cancelled');
    }

    // Find the best voice for the language
    const selectedVoice = findBestVoice(lang);
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if available
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    } else {
      // Fallback language settings
      utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
      console.log(`Using fallback language: ${utterance.lang}`);
    }
    
    // Optimize speech parameters
    utterance.rate = lang === 'hi' ? 0.9 : 1.0; // Slightly slower for Hindi
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      console.log('TTS started');
      setIsPlaying(true);
      setIsPaused(false);
      setActiveMessageId(messageId);
    };

    utterance.onend = () => {
      console.log('TTS ended');
      setIsPlaying(false);
      setIsPaused(false);
      setActiveMessageId(null);
      utteranceRef.current = null;
    };
    
    utterance.onerror = (event) => {
      console.error('TTS error:', event.error, event);
      setIsPlaying(false);
      setIsPaused(false);
      setActiveMessageId(null);
      utteranceRef.current = null;
    };

    utterance.onpause = () => {
      console.log('TTS paused by system');
      setIsPaused(true);
    };

    utterance.onresume = () => {
      console.log('TTS resumed by system');
      setIsPaused(false);
    };

    // Add a small delay to ensure the voice is ready
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
        console.log('TTS utterance queued');
      } catch (error) {
        console.error('Error starting TTS:', error);
        setIsPlaying(false);
        setIsPaused(false);
        setActiveMessageId(null);
        utteranceRef.current = null;
      }
    }, 100);
  }, [isPlaying, isPaused, activeMessageId, findBestVoice]);
  
  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setActiveMessageId(null);
      utteranceRef.current = null;
      console.log('TTS cancelled by user');
    }
  }, []);

  // Function to test TTS with a sample text
  const testTTS = useCallback((lang: 'en' | 'hi') => {
    const testText = lang === 'hi' 
      ? 'नमस्ते, मैं आपकी सहायता कर सकता हूं।'
      : 'Hello, I can help you with government schemes.';
    
    console.log(`Testing TTS for ${lang}`);
    togglePlayPause(testText, 'test-message', lang);
  }, [togglePlayPause]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { 
    isPlaying, 
    isPaused, 
    activeMessageId, 
    togglePlayPause, 
    cancel, 
    availableVoices,
    testTTS 
  };
};
