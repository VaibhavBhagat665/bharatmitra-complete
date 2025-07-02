import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { ChatMessage as ChatMessageType, MessageSender } from '../types';
import { getSchemeAdvice } from '../services/geminiService';
import ChatMessage from '../components/ChatMessage';
// import { MicIcon } from '../components/icons/MicIcon';
import { SendIcon } from '../components/icons/SendIcon';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { UserContext } from '../contexts/UserContext';

const ChatPage: React.FC = () => {
  const { addTokens, language, togglePlayPause } = useContext(UserContext);

  const getInitialMessage = (lang: 'en' | 'hi') => ({
    id: new Date().toISOString() + Math.random(),
    sender: MessageSender.AI,
    text: lang === 'hi'
      ? 'नमस्ते! मैं भारत मित्र हूँ। आज मैं आपकी मदद कैसे कर सकता हूँ? मुझसे किसी भी सरकारी योजना के बारे में पूछें।'
      : 'Namaste! I am Bharat Mitra. How can I help you today? Ask me about any government scheme.',
    timestamp: new Date().toISOString(),
  });

  const [messages, setMessages] = useState<ChatMessageType[]>([getInitialMessage(language)]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { transcript, isListening, startListening, stopListening, error: recognitionError } = useSpeechRecognition(language);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([getInitialMessage(language)]);
  }, [language]);

  useEffect(() => {
    setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessageType = {
      id: new Date().toISOString() + Math.random(),
      sender: MessageSender.USER,
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponseText = await getSchemeAdvice(input, language);

      const friendlyGreeting = language === 'hi'
        ? `नमस्ते, मैं भारत मित्र हूँ। आपके सवाल का जवाब यहाँ है...\n\n`
        : `Namaste, I am Bharat Mitra. Here is the answer to your question...\n\n`;

      const aiMessage: ChatMessageType = {
        id: new Date().toISOString() + Math.random(),
        sender: MessageSender.AI,
        text: aiResponseText,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
      togglePlayPause(friendlyGreeting + aiResponseText, aiMessage.id, language);
      addTokens(10);
    } catch (error) {
      console.error('Error fetching AI response:', error);

      const errorMessageText = language === 'hi'
        ? 'माफ़ करें, कुछ त्रुटि हुई है। कृपया फिर से कोशिश करें।'
        : 'Sorry, I encountered an error. Please try again.';

      const errorMessage: ChatMessageType = {
        id: new Date().toISOString() + Math.random(),
        sender: MessageSender.AI,
        text: errorMessageText,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, addTokens, togglePlayPause, language]);

  const handleMicClick = () => {
    isListening ? stopListening() : startListening();
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-fixed bg-[url('https://www.transparenttextures.com/patterns/flowers.png')] bg-red-50 bg-blend-overlay bg-opacity-90">
      <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 backdrop-blur-md">
        <div className="p-4 border-b bg-bharat-blue-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-bharat-blue-900">Chat with Bharat Mitra</h2>
        </div>

        <div className="flex-grow p-6 overflow-y-auto">
          <div className="space-y-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
{/*             <button
              onClick={handleMicClick}
              className={`flex-shrink-0 p-3 rounded-full transition-colors duration-200 ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-bharat-blue-100 text-bharat-blue-700 hover:bg-bharat-blue-200'
              }`}
              aria-label={isListening ? 'Stop recording' : 'Start recording'}
            >
              <MicIcon className="h-6 w-6" />
            </button> */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? 'Listening...' : 'Type your question here...'}
              className="flex-grow w-full px-4 py-3 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 transition"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || input.trim() === ''}
              className="flex-shrink-0 bg-bharat-blue-700 text-white p-3 rounded-full hover:bg-bharat-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110"
              aria-label="Send message"
            >
              <SendIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
