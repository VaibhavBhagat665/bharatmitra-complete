import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { ChatMessage as ChatMessageType, MessageSender } from '../types';
import { getSchemeAdvice } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { UserContext } from '../contexts/UserContext';
import { MicIcon } from '../components/icons/MicIcon';
import ChatMessage from '../components/ChatMessage';

const VoiceChatPage: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { rewardTokens, language, togglePlayPause } = useContext(UserContext);
    const { transcript, isListening, startListening, stopListening, error: recognitionError } = useSpeechRecognition(language);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleAiResponse = useCallback(async (query: string) => {
        setIsProcessing(true);
        const userMessage: ChatMessageType = {
            id: new Date().toISOString() + Math.random(),
            sender: MessageSender.USER,
            text: query,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const aiResponseText = await getSchemeAdvice(query, language);
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
            await rewardTokens(10, 'voice-chat-interaction');
        } catch (error) {
            console.error('Error fetching AI response:', error);
            const errorMessageText = 'Sorry, I encountered an error. Please try again.';
            const errorMessage: ChatMessageType = {
                id: new Date().toISOString() + Math.random(),
                sender: MessageSender.AI,
                text: errorMessageText,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsProcessing(false);
        }
    }, [rewardTokens, togglePlayPause, language]);
    
    // Reset chat when language changes
    useEffect(() => {
        setMessages([]);
    }, [language]);


    // Effect to process transcript when listening stops
    useEffect(() => {
        if (!isListening && transcript.trim() && !isProcessing) {
            handleAiResponse(transcript);
        }
    }, [isListening, transcript, handleAiResponse, isProcessing]);
    
    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };
    
    const getButtonState = () => {
        if (isProcessing) return { text: "Processing...", color: "bg-gray-400", disabled: true};
        if (isListening) return { text: "Listening... Tap to Stop", color: "bg-red-500 animate-pulse", disabled: false };
        return { text: "Tap to Speak", color: "bg-bharat-blue-700", disabled: false };
    }
    
    const buttonState = getButtonState();

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200">
             <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-bharat-blue-900 text-center">Voice Chat</h2>
            </div>
            <div className="flex-grow p-6 overflow-y-auto">
                 {messages.length === 0 && !isListening && !isProcessing && (
                    <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
                        <p className="text-xl">Tap the microphone below to start a conversation.</p>
                    </div>
                )}
                <div className="space-y-6">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    <div ref={chatEndRef} />
                </div>
            </div>
            <div className="border-t-2 p-6 flex flex-col items-center justify-center space-y-4">
                {recognitionError && (
                    <div className="text-center text-red-600 bg-red-100 p-2 rounded-md -mt-2 mb-2 text-sm w-full">
                        {recognitionError}
                    </div>
                 )}
                <button
                    onClick={handleMicClick}
                    disabled={buttonState.disabled}
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-colors duration-300 shadow-lg transform hover:scale-105 ${buttonState.color}`}
                    aria-label={buttonState.text}
                >
                    <MicIcon className="h-10 w-10" />
                </button>
                <p className="text-gray-600 font-medium h-6">{buttonState.text}</p>
                 <p className="text-gray-500 text-sm h-5 px-4 text-center">{transcript}</p>
            </div>
        </div>
    );
};

export default VoiceChatPage;