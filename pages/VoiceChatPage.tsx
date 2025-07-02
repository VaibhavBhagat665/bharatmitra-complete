import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { ChatMessage as ChatMessageType, MessageSender } from '../types';
import { getSchemeAdvice } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { UserContext } from '../contexts/UserContext';
import { MicIcon } from '../components/icons/MicIcon';
import ChatMessage from '../components/ChatMessage';

const EnhancedVoiceChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const { addTokens } = useContext(UserContext);
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
      const aiResponseText = await getSchemeAdvice(query, language);
      
      // Create contextual greeting based on detected language
      const friendlyGreeting = language === 'hi'
        ? `नमस्ते! मैं भारत मित्र हूँ।\n\n`
        : `Hello! I am Bharat Mitra.\n\n`;

      const aiMessage: ChatMessageType = {
        id: `ai-${Date.now()}-${Math.random()}`,
        sender: MessageSender.AI,
        text: aiResponseText,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Auto-play the AI response in the same language as user input
      const fullResponse = friendlyGreeting + aiResponseText;
      setTimeout(() => {
        togglePlayPause(fullResponse, aiMessage.id, language);
      }, 300);
      
      addTokens(10);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      
      const errorText = language === 'hi' 
        ? 'माफ करें, मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें।'
        : 'Sorry, I encountered an error. Please try again.';
        
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
  }, [addTokens, togglePlayPause, isProcessingAI, resetSession]);

  // Handle completed speech recognition
  useEffect(() => {
    if (isComplete && transcript.trim() && !isProcessingAI) {
      console.log('Speech complete, processing:', transcript);
      handleAiResponse(transcript, detectedLanguage);
    }
  }, [isComplete, transcript, detectedLanguage, handleAiResponse, isProcessingAI]);

  // Auto-scroll to bottom when new messages arrive
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
        text: "प्रसंस्करण हो रहा है... / Processing...", 
        color: "bg-yellow-500 animate-pulse", 
        disabled: true 
      };
    }
    
    if (isListening) {
      return { 
        text: "सुन रहा हूँ... बंद करने के लिए टैप करें / Listening... Tap to Stop", 
        color: "bg-red-500 animate-pulse", 
        disabled: false 
      };
    }
    
    return { 
      text: "बोलने के लिए टैप करें / Tap to Speak", 
      color: "bg-green-600 hover:bg-green-700", 
      disabled: false 
    };
  };

  const buttonState = getButtonState();

  const getWelcomeMessage = () => {
    return {
      hindi: "नमस्ते! मैं भारत मित्र हूँ। कृपया माइक्रोफोन पर टैप करके अपना प्रश्न हिंदी या अंग्रेजी में पूछें।",
      english: "Namaste! I am Bharat Mitra. Please tap the microphone and ask your question in Hindi or English."
    };
  };

  const welcomeMessage = getWelcomeMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-green-50 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-2">
            🎙️ भारत मित्र Voice Chat
          </h1>
          <p className="text-gray-600 text-lg">
            हिंदी या English में बोलें - मैं उसी भाषा में जवाब दूंगा!
          </p>
          <p className="text-gray-500">
            Speak in Hindi or English - I'll respond in the same language!
          </p>
          
          {detectedLanguage && transcript && (
            <div className="mt-3 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
              🗣️ भाषा / Language: {detectedLanguage === 'hi' ? 'हिंदी (Hindi)' : 'English (अंग्रेजी)'}
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
                  <p className="text-lg font-medium text-orange-700">{welcomeMessage.hindi}</p>
                  <p className="text-lg font-medium text-green-700">{welcomeMessage.english}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <span className="w-3 h-3 bg-orange-400 rounded-full mr-2"></span>
                    हिंदी में बोलें
                  </span>
                  <span className="flex items-center">
                    <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                    Speak in English
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
                      {detectedLanguage === 'hi' ? 'आपका संदेश:' : 'Your Message:'}
                      <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                        {detectedLanguage === 'hi' ? 'हिंदी' : 'English'}
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
                    🔊 स्पष्ट रूप से बोलें / Speak clearly
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">🇮🇳 हिंदी में बोलें</h3>
            <p className="text-orange-700">
              स्पष्ट रूप से हिंदी में अपना प्रश्न पूछें। मैं हिंदी में जवाब दूंगा।
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">🇬🇧 Speak in English</h3>
            <p className="text-green-700">
              Ask your question clearly in English. I will respond in English.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVoiceChatPage;
