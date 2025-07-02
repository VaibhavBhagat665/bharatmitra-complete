import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { ChatMessage as ChatMessageType, MessageSender } from '../types';
import { getSchemeAdvice } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { UserContext } from '../contexts/UserContext';
import { MicIcon } from '../components/icons/MicIcon';
import ChatMessage from '../components/ChatMessage';
import { cleanVoiceResponse, cleanTextForDisplay } from '../utils/textCleanup';

const EnhancedVoiceChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const { addTokens, setLanguage } = useContext(UserContext);
  const { 
    isListening, 
    transcript, 
    detectedLanguage,
    error: recognitionError,
    isComplete,
    startListening,
    stopListening,
    resetSession
  } = useSpeechRecognition();
  
  const { isPlaying, togglePlayPause } = useTextToSpeech();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const processedTranscriptRef = useRef<string>('');

  // Update context language when speech language is detected
  useEffect(() => {
    if (detectedLanguage) {
      setLanguage(detectedLanguage);
      console.log('Updated context language to:', detectedLanguage);
    }
  }, [detectedLanguage, setLanguage]);

  const handleAiResponse = useCallback(async (query: string, language: 'en' | 'hi') => {
    if (!query.trim() || isProcessingAI || query === processedTranscriptRef.current) return;
    
    console.log('Processing AI response for:', query, 'in language:', language);
    processedTranscriptRef.current = query;
    setIsProcessingAI(true);

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}-${Math.random()}`,
      sender: MessageSender.USER,
      text: query,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const rawAiResponse = await getSchemeAdvice(query, language);
      
      // Clean the AI response for display and speech
      const displayText = cleanTextForDisplay(rawAiResponse);
      const speechText = cleanVoiceResponse(rawAiResponse, language);
      
      console.log('Original AI response:', rawAiResponse);
      console.log('Cleaned for display:', displayText);
      console.log('Cleaned for speech:', speechText);
      
      const aiMessage: ChatMessageType = {
        id: `ai-${Date.now()}-${Math.random()}`,
        sender: MessageSender.AI,
        text: displayText, // Use cleaned text for display
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Auto-play the AI response with cleaned speech text
      setTimeout(() => {
        togglePlayPause(speechText, aiMessage.id, language);
      }, 300);
      
     
    } catch (error) {
      console.error('Error fetching AI response:', error);
      
      const errorText = language === 'hi' 
        ? 'माफ करें, कुछ गलत हुआ। फिर से कोशिश करें।'
        : 'Sorry, something went wrong. Please try again.';
        
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}-${Math.random()}`,
        sender: MessageSender.AI,
        text: errorText,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessingAI(false);
      resetSession();
      processedTranscriptRef.current = '';
    }
  }, [addTokens, togglePlayPause, isProcessingAI, resetSession, setLanguage]);

  useEffect(() => {
    if (isComplete && transcript.trim() && !isProcessingAI) {
      console.log('Speech complete, processing:', transcript, 'Language:', detectedLanguage);
      handleAiResponse(transcript, detectedLanguage);
    }
  }, [isComplete, transcript, detectedLanguage, handleAiResponse, isProcessingAI]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMicClick = () => {
    if (isProcessingAI) return;
    
    if (isListening) {
      stopListening();
    } else {
      if (isPlaying) {
        window.speechSynthesis?.cancel();
      }
      startListening();
    }
  };

  const getButtonState = () => {
    if (isProcessingAI) {
      return { 
        text: "Processing...", 
        color: "bg-yellow-500 animate-pulse", 
        disabled: true 
      };
    }
    
    if (isListening) {
      return { 
        text: "Listening... Tap to Stop", 
        color: "bg-red-500 animate-pulse", 
        disabled: false 
      };
    }
    
    return { 
      text: "Tap to Speak", 
      color: "bg-green-600 hover:bg-green-700", 
      disabled: false 
    };
  };

  const buttonState = getButtonState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-2">
            🎙️ Bharat Mitra Voice Chat
          </h1>
          <p className="text-gray-600 text-lg">
            Ask your questions in Hindi or English
          </p>
          
          {detectedLanguage && transcript && (
            <div className="mt-3 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
              🗣️ Detected: {detectedLanguage === 'hi' ? 'Hindi' : 'English'}
            </div>
          )}
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 bg-gradient-to-b from-orange-50/30 to-green-50/30">
            {messages.length === 0 ? (
              <div className="text-center text-gray-600 flex flex-col items-center justify-center h-full space-y-4">
                <div className="text-6xl animate-bounce">🤖</div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">
                    Welcome! I'm Bharat Mitra. Ask me about government schemes and benefits.
                  </p>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center">
                    <span className="w-3 h-3 bg-orange-400 rounded-full mr-2"></span>
                    Hindi Supported
                  </span>
                  <span className="flex items-center">
                    <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                    English Supported
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Voice Input Section */}
          <div className="border-t bg-white p-6">
            {/* Error Display */}
            {recognitionError && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex items-center">
                  <div className="text-red-400 mr-3">⚠️</div>
                  <p className="text-red-700 font-medium">{recognitionError}</p>
                </div>
              </div>
            )}

            {/* Live Transcript Display */}
            {transcript.trim() && (
              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-400 text-xl">🎯</div>
                  <div className="flex-1">
                    <p className="text-blue-800 text-sm font-medium mb-1">
                      Your Message:
                      <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                        {detectedLanguage === 'hi' ? 'Hindi' : 'English'}
                      </span>
                    </p>
                    <p className="text-blue-900 text-lg leading-relaxed">{transcript}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Microphone Button */}
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={handleMicClick}
                disabled={buttonState.disabled}
                className={`
                  relative w-24 h-24 rounded-full flex items-center justify-center text-white 
                  transition-all duration-300 transform hover:scale-105 active:scale-95
                  shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                  ${buttonState.color} focus:outline-none focus:ring-4 focus:ring-blue-300
                `}
                aria-label={buttonState.text}
              >
                <MicIcon className="h-10 w-10 drop-shadow-sm" />
                {isListening && (
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
                )}
              </button>

              {/* Button Status */}
              <div className="text-center max-w-md">
                <p className="text-gray-700 font-medium text-lg leading-tight">
                  {buttonState.text}
                </p>
                {isListening && (
                  <p className="text-sm text-gray-500 mt-2 animate-pulse">
                    🔊 Speak clearly
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-white/50 rounded-lg p-4 text-center">
          <p className="text-gray-600">
            💡 Tip: Speak naturally in either Hindi or English. The system will automatically detect your language.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVoiceChatPage;
