
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
    utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
    utterance.rate = 1;
    utterance.pitch = 1;
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setActiveMessageId(messageId);
    };

    utterance.onend = () => {
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
    }
    
    window.speechSynthesis.speak(utterance);
  }, [isPlaying, isPaused, activeMessageId]);
  
  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setActiveMessageId(null);
    }
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { isPlaying, isPaused, activeMessageId, togglePlayPause, cancel };
};
