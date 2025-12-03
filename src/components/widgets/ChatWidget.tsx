import { useState, useEffect, useRef } from 'react';

interface Message {
  text: string;
  type: 'user' | 'agent';
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hello! I am Luna.<br>How can I help you today?', type: 'agent' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Generate stars on mount
  useEffect(() => {
    if (!isOpen || !starsContainerRef.current) return;

    const starsContainer = starsContainerRef.current;
    const numberOfStars = 100;
    const sunRadius = 125; // Half of the sun's 250px width/height
    const minStarRadius = sunRadius + 15;
    const maxStarRadius = sunRadius + 120;

    // Clear existing stars
    starsContainer.innerHTML = '';

    for (let i = 0; i < numberOfStars; i++) {
      const star = document.createElement('div');
      star.className = 'star';

      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      // Random position in a circle around the sun's center
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * (maxStarRadius - minStarRadius) + minStarRadius;
      const xOffset = radius * Math.cos(angle);
      const yOffset = radius * Math.sin(angle);

      star.style.left = `calc(50% + ${xOffset}px)`;
      star.style.top = `calc(50% + ${yOffset}px)`;
      star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      star.style.animationDelay = `${Math.random() * 3}s`;

      starsContainer.appendChild(star);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    const messageText = inputValue.trim();
    if (!messageText) return;

    // Add user message
    setMessages(prev => [...prev, { text: messageText, type: 'user' }]);
    setInputValue('');

    // Simulate agent reply
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: 'Thanks for your message! An agent will be with you shortly.', 
        type: 'agent' 
      }]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-indigo-700 transition-colors z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div id="chat-widget" className="fixed bottom-28 right-8 w-full max-w-sm h-full max-h-[600px] rounded-2xl shadow-lg z-50 flex flex-col overflow-hidden backdrop-blur-xl border border-white/30 dark:border-slate-700">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Messages */}
          <div 
            ref={messagesRef}
            id="chat-messages" 
            className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar flex flex-col relative"
          >
            {/* Stars Container */}
            <div ref={starsContainerRef} id="stars-container" className="absolute top-0 left-0 w-full h-full overflow-hidden z-[1]"></div>
            
            {/* Sun Animation */}
            <div className="section-banner-sun"></div>

            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.type}-message p-3 rounded-lg max-w-[80%] ${
                  message.type === 'user' 
                    ? 'user-message self-end' 
                    : 'agent-message self-start'
                }`}
                style={{ position: 'relative', zIndex: 5 }}
                dangerouslySetInnerHTML={{ __html: message.text }}
              />
            ))}
          </div>

          {/* Input */}
          <div className="p-4 flex-shrink-0 border-t border-white/30 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="chat-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full h-10 px-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-300 text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-indigo-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

