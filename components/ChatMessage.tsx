import React, { useContext } from 'react';
import { ChatMessage as ChatMessageType, MessageSender } from '../types';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
// import { PlayIcon } from './icons/PlayIcon';
// import { PauseIcon } from './icons/PauseIcon';
import { UserContext } from '../contexts/UserContext';

interface ChatMessageProps {
  message: ChatMessageType;
}

const LinkifiedText: React.FC<{ text: string }> = ({ text }) => {
  const urlRegex = /(\bhttps?:\/\/[^\s]+)/gi;
  const parts = text.split(urlRegex);

  return (
    <p className="text-gray-800 whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (part && part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium break-all"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </p>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.sender === MessageSender.AI;
  const { 
    language,
    togglePlayPause, 
    isSpeaking, 
    isPaused, 
    activeUtteranceId 
  } = useContext(UserContext);

  const isThisMessageActive = activeUtteranceId === message.id;
  
  const detectLanguage = (text: string): 'en' | 'hi' => {
    const hindiPattern = /[\u0900-\u097F]/;
    const hindiCharCount = (text.match(/[\u0900-\u097F]/g) || []).length;
    const totalChars = text.replace(/\s/g, '').length;
    
    return hindiCharCount / totalChars > 0.2 ? 'hi' : 'en';
  };

  const handleSpeakClick = () => {
    const messageLanguage = detectLanguage(message.text);
    
    const voiceLanguage = isAI ? messageLanguage : language;
    
    togglePlayPause(message.text, message.id, voiceLanguage);
  };

  return (
    <div className={`flex items-start gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isAI ? 'bg-bharat-blue-100 text-bharat-blue-700' : 'bg-gray-200 text-gray-600'}`}>
        {isAI ? <BotIcon className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
      </div>
      <div className={`relative px-4 py-3 rounded-xl max-w-lg ${isAI ? 'bg-bharat-blue-50 border border-bharat-blue-100' : 'bg-bharat-green-100 border border-bharat-green-200'}`}>
        <LinkifiedText text={message.text} />
{/*         {isAI && (
           // <button 
           //    onClick={handleSpeakClick} 
           //    className="absolute -bottom-3 -right-3 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-bharat-blue-600 hover:bg-gray-50 transition-all duration-200 hover:scale-110"
           //    aria-label="Speak this message"
           //    title={isThisMessageActive && isSpeaking && !isPaused ? "Pause speech" : "Play speech"}
           //  >
           //    {isThisMessageActive && isSpeaking && !isPaused 
           //      ? <PauseIcon className="w-4 h-4 text-bharat-blue-700" /> 
           //      : <PlayIcon className="w-4 h-4" />
           //    }
           // </button>
        // )} */}
      </div>
    </div>
  );
};

export default ChatMessage;
