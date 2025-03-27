'use client';

import { useEffect, useState } from 'react';

export default function LiveChatPage() {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'system', message: 'Welcome to AlgoZ Support. How can we help you today?', timestamp: new Date().toISOString() }
  ]);

  useEffect(() => {
    document.title = 'Live Chat Support | AlgoZ';
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: chatMessages.length + 1,
      sender: 'user',
      message: message,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Simulate agent response after 2 seconds
    setTimeout(() => {
      const agentMessage = {
        id: chatMessages.length + 2,
        sender: 'agent',
        message: 'Thank you for your message. Our support team will be with you shortly.',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, agentMessage]);
    }, 2000);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Live Chat Support</h1>
      
      <div className="max-w-4xl bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-zinc-900 p-3 border-b border-zinc-700 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
            <h2 className="font-medium">Support Agent</h2>
          </div>
          <span className="text-xs text-zinc-400">Online</span>
        </div>
        
        <div className="h-96 p-4 overflow-y-auto">
          {chatMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : msg.sender === 'agent' 
                      ? 'bg-zinc-700 text-white' 
                      : 'bg-zinc-900 text-zinc-300'
                }`}
              >
                <p>{msg.message}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-3 border-t border-zinc-700">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 p-2 bg-zinc-900 border border-zinc-700 rounded-md text-white"
            />
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
