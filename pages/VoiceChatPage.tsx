import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { ChatMessage as ChatMessageType, MessageSender } from '../types';
import { getSchemeAdvice } from '../services/geminiService';
import { useEnhancedSpeechRecognition } from '../hooks/useEnhancedSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { UserContext } from '../contexts/UserContext';
import { MicIcon } from '../components/icons/MicIcon';
import ChatMessage from '../components/ChatMessage';

const VoiceChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const { addTokens } = useContext(UserContext);
  const { 
    isListening, 
    transcript, 
    detectedLanguage,
    error: recognitionError,
    isProcessingComplete,
    startListening,
    stopListening,
    resetSession
  } = useEnhancedSpeechRecognition();
  
  const { isPlaying, activeMessageId, togglePlayPause } = useTextToSpeech();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedCurrentTranscript = useRef(false);

  const handleAiResponse = useCallback(async (query: string, language: 'en' | 'hi') => {
    if (!query.trim() || isProcessingAI) return;
    
    setIsProcessingAI(true);
    hasProcessedCurrentTranscript.current = true;

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
        ? `नमस्ते! मैं भारत मित्र हूँ। आपके प्रश्न का उत्तर यहाँ है:\n\n`
        : `Hello! I am Bharat Mitra. Here's the answer to your question:\n\n`;

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
      }, 500); // Small delay to ensure message is rendered
      
      addTokens(10);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      
      const errorText = language === 'hi' 
        ? 'खुशी है कि माफी, मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें।'
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
      // Reset for next input
      resetSession();
      hasProcessedCurrentTranscript.current = false;
    }
  }, [addTokens, togglePlayPause, isProcessingAI, resetSession]);

  // Handle completed speech recognition
  useEffect(() => {
    if (isProcessingComplete && 
        transcript.trim() && 
        !hasProcessedCurrentTranscript.current && 
        !isProcessingAI) {
      
      handleAiResponse(transcript, detectedLanguage);
    }
  }, [isProcessingComplete, transcript, detectedLanguage, handleAiResponse, isProcessingAI]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMicClick = () => {
    if (isProcessingAI) return; // Prevent interaction during AI processing
    
    if (isListening) {
      stopListening();
    } else {
      // Stop any playing audio before starting to listen
      if (isPlaying) {
        window.speechSynthesis?.cancel();
      }
      startListening();
    }
  };

  const getButtonState = () => {
    if (isProcessingAI) {
      return { 
        text: detectedLanguage === 'hi' ? "प्रसंस्करण..." : "Processing...", 
        color: "bg-amber-500 animate-pulse", 
        disabled: true 
      };
    }
    
    if (isListening) {
      const listeningText = detectedLanguage === 'hi' 
        ? "सुन रहा हूँ... रोकने के लिए टैप करें" 
        : "Listening... Tap to Stop";
      return { 
        text: listeningText, 
        color: "bg-red-500 animate-pulse", 
        disabled: false 
      };
    }
    
    const defaultText = detectedLanguage === 'hi' 
      ? "बोलने के लिए टैप करें" 
      : "Tap to Speak";
    return { 
      text: defaultText, 
      color: "bg-green-600 hover:bg-green-700", 
      disabled: false 
    };
  };

  const buttonState = getButtonState();

  // Get welcome message based on current or detected language
  const getWelcomeMessage = () => {
    const lang = detectedLanguage || 'en';
    if (lang === 'hi') {
      return "नमस्ते! मैं भारत मित्र हूँ। कृपया माइक्रोफोन पर टैप करके अपना प्रश्न पूछें।";
    }
    return "Namaste! I am Bharat Mitra. Please tap the microphone and ask your question.";
  };

  // Get transcript display text
  const getTranscriptDisplay = () => {
    if (!transcript.trim()) return '';
    
    const lang = detectedLanguage;
    const prefix = lang === 'hi' ? "आप कह रहे हैं: " : "You're saying: ";
    return prefix + transcript;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎙️ भारत मित्र Voice Chat
          </h1>
          <p className="text-gray-600">
            Speak in Hindi or English - I'll respond in the same language!
          </p>
          {detectedLanguage && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Language Detected: {detectedLanguage === 'hi' ? 'हिंदी' : 'English'}
            </div>
          )}
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-lg font-medium mb-2">{getWelcomeMessage()}</p>
                <p className="text-sm text-gray-400">
                  हिंदी या English में बोलें - मैं उसी भाषा में जवाब दूंगा!
                </p>
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
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                {recognitionError}
              </div>
            )}

            {/* Transcript Display */}
            {transcript.trim() && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm font-medium mb-1">
                  {detectedLanguage === 'hi' ? 'पहचाना गया टेक्स्ट:' : 'Recognized Text:'}
                </p>
                <p className="text-blue-900">{transcript}</p>
              </div>
            )}

            {/* Microphone Button */}
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={handleMicClick}
                disabled={buttonState.disabled}
                className={`
                  w-20 h-20 rounded-full flex items-center justify-center text-white 
                  transition-all duration-300 transform hover:scale-105 
                  shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                  ${buttonState.color}
                `}
                aria-label={buttonState.text}
              >
                <MicIcon className="h-8 w-8" />
              </button>

              <div className="text-center">
                <p className="text-gray-700 font-medium">{buttonState.text}</p>
                {isListening && (
                  <p className="text-xs text-gray-500 mt-1">
                    {detectedLanguage === 'hi' 
                      ? 'स्पष्ट रूप से बोलें और फिर चुप रहें' 
                      : 'Speak clearly and then pause'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 Tip: I automatically detect whether you're speaking Hindi or English!</p>
          <p>युक्ति: मैं अपने आप पहचान लेता हूँ कि आप हिंदी या अंग्रेजी में बोल रहे हैं!</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceChatPage;
