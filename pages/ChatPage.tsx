import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { ChatMessage as ChatMessageType, MessageSender } from '../types';
import { getSchemeAdvice } from '../services/geminiService';
import ChatMessage from '../components/ChatMessage';
import { SendIcon } from '../components/icons/SendIcon';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { UserContext } from '../contexts/UserContext';

const ChatPage: React.FC = () => {
  const { addTokens, language, togglePlayPause } = useContext(UserContext);

  const getInitialMessage = (lang: 'en' | 'hi') => ({
    id: new Date().toISOString() + Math.random(),
    sender: MessageSender.AI,
    text: lang === 'hi'
      ? 'नमस्ते! मैं भारत मित्र हूँ। मैं आपको सरकारी योजनाओं के बारे में जानकारी देने के लिए यहाँ हूँ। आप मुझसे छात्रवृत्ति, किसान योजना, महिला कल्याण, व्यापारिक ऋण, या किसी भी सरकारी योजना के बारे में पूछ सकते हैं।'
      : 'Namaste! I am Bharat Mitra. I am here to help you with information about government schemes. You can ask me about scholarships, farmer schemes, women welfare, business loans, or any government scheme.',
    timestamp: new Date().toISOString(),
  });

  const [messages, setMessages] = useState<ChatMessageType[]>([getInitialMessage(language)]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { transcript, isListening, startListening, stopListening, error: recognitionError } = useSpeechRecognition(language);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([getInitialMessage(language)]);
  }, [language]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper function to validate user input
  const validateInput = (text: string): boolean => {
    const trimmed = text.trim();
    return trimmed.length > 0 && trimmed.length <= 500; // Reasonable length limit
  };

  // Helper function to provide quick suggestions
  const getQuickSuggestions = (lang: 'en' | 'hi') => {
    const suggestions = {
      en: [
        "I need a scholarship",
        "Farmer loan schemes",
        "Women welfare schemes", 
        "Business loan schemes",
        "Senior citizen schemes",
        "Health insurance schemes"
      ],
      hi: [
        "मुझे छात्रवृत्ति चाहिए",
        "किसान लोन योजनाएं",
        "महिला कल्याण योजनाएं",
        "व्यापारिक ऋण योजनाएं", 
        "वृद्धावस्था योजनाएं",
        "स्वास्थ्य बीमा योजनाएं"
      ]
    };
    return suggestions[lang] || suggestions.en;
  };

  const handleSendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText || input;
    
    if (!validateInput(textToSend) || isLoading) return;

    const userMessage: ChatMessageType = {
      id: new Date().toISOString() + Math.random(),
      sender: MessageSender.USER,
      text: textToSend,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setRetryCount(0);

    try {
      const aiResponseText = await getSchemeAdvice(textToSend, language);

      const aiMessage: ChatMessageType = {
        id: new Date().toISOString() + Math.random(),
        sender: MessageSender.AI,
        text: aiResponseText,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Add friendly greeting for audio
      const friendlyGreeting = language === 'hi'
        ? `भारत मित्र आपकी सेवा में। `
        : `Bharat Mitra at your service. `;

      togglePlayPause(friendlyGreeting + aiResponseText, aiMessage.id, language);
      addTokens(10);
      
    } catch (error) {
      console.error('Error fetching AI response:', error);
      
      const errorMessageText = language === 'hi'
        ? 'माफ़ करें, मुझे कुछ तकनीकी समस्या हो रही है। कृपया कुछ देर बाद फिर कोशिश करें।'
        : 'Sorry, I am experiencing some technical issues. Please try again in a moment.';

      const errorMessage: ChatMessageType = {
        id: new Date().toISOString() + Math.random(),
        sender: MessageSender.AI,
        text: errorMessageText,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
      setRetryCount(prev => prev + 1);
      
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, addTokens, togglePlayPause, language]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = messages
        .slice()
        .reverse()
        .find(msg => msg.sender === MessageSender.USER);
      
      if (lastUserMessage) {
        handleSendMessage(lastUserMessage.text);
      }
    }
  };

  const quickSuggestions = getQuickSuggestions(language);
  const showSuggestions = messages.length <= 1; // Show only initially

  return (
    <div className="min-h-screen px-4 py-8 bg-fixed bg-[url('https://www.transparenttextures.com/patterns/flowers.png')] bg-red-50 bg-blend-overlay bg-opacity-90">
      <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 backdrop-blur-md">
        <div className="p-4 border-b bg-bharat-blue-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-bharat-blue-900">
            {language === 'hi' ? 'भारत मित्र से बात करें' : 'Chat with Bharat Mitra'}
          </h2>
          <p className="text-sm text-bharat-blue-700 mt-1">
            {language === 'hi' 
              ? 'सरकारी योजनाओं की जानकारी पाएं' 
              : 'Get information about government schemes'}
          </p>
        </div>

        <div className="flex-grow p-6 overflow-y-auto">
          <div className="space-y-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
              <div className="flex items-center space-x-2 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-bharat-blue-100 flex items-center justify-center">
                  <span className="text-bharat-blue-600 text-sm font-medium">BM</span>
                </div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            )}
            
            {retryCount > 0 && !isLoading && (
              <div className="text-center">
                <button
                  onClick={handleRetry}
                  className="text-bharat-blue-600 hover:text-bharat-blue-800 text-sm underline"
                >
                  {language === 'hi' ? 'फिर से कोशिश करें' : 'Try again'}
                </button>
              </div>
            )}
            
            {showSuggestions && (
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-bharat-blue-500">
                <p className="text-sm text-gray-700 mb-3 font-medium">
                  {language === 'hi' ? 'आप यह भी पूछ सकते हैं:' : 'You can also ask:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-white hover:bg-bharat-blue-50 text-bharat-blue-700 px-3 py-2 rounded-full border border-bharat-blue-200 hover:border-bharat-blue-300 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="border-t-2 border-gray-200 p-4 bg-gray-50 rounded-b-xl">
          {recognitionError && (
            <div className="text-center text-red-600 bg-red-100 p-2 rounded-md mb-2 text-sm">
              {recognitionError}
            </div>
          )}

          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isListening 
                  ? (language === 'hi' ? 'सुन रहा हूँ...' : 'Listening...') 
                  : (language === 'hi' ? 'अपना प्रश्न यहाँ लिखें...' : 'Type your question here...')
              }
              className="flex-grow w-full px-4 py-3 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 transition disabled:bg-gray-100"
              disabled={isLoading}
              maxLength={500}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !validateInput(input)}
              className="flex-shrink-0 bg-bharat-blue-700 text-white p-3 rounded-full hover:bg-bharat-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
              aria-label={language === 'hi' ? 'संदेश भेजें' : 'Send message'}
            >
              <SendIcon className="h-6 w-6" />
            </button>
          </div>
          
          {input.length > 400 && (
            <div className="text-xs text-gray-500 mt-1 text-right">
              {input.length}/500
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
