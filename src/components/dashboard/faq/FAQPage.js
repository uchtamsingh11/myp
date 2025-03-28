'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  // State to track which FAQ items are expanded
  const [expandedItems, setExpandedItems] = useState({});

  // Toggle FAQ item expansion
  const toggleItem = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // FAQ data
  const faqItems = [
    {
      id: 1,
      question: "What is this trading platform about?",
      answer: "Our trading platform provides advanced tools for traders, including TradingView integration, scalping tools, and copy trading features. We aim to help traders of all experience levels make more informed decisions and execute trades efficiently."
    },
    {
      id: 2,
      question: "How do I connect my broker account?",
      answer: "You can connect your broker account through the 'Broker Auth' section in the dashboard. We support multiple brokers and exchanges. Simply follow the authentication process, provide the necessary API keys, and set the required permissions for trading."
    },
    {
      id: 3,
      question: "What is the TradingView integration?",
      answer: "Our TradingView integration allows you to connect your TradingView alerts directly to our platform. This enables automated trade execution based on your TradingView indicators and strategies. You can set up webhooks, manage symbols, and view trade logs all from the dashboard."
    },
    {
      id: 4,
      question: "How does the Scalping Tool work?",
      answer: "The Scalping Tool is designed for short-term traders who need quick execution and precise entry/exit points. It provides customizable hotkeys, one-click trading, and risk management features. You can set predefined risk levels, take profit targets, and stop loss levels for efficient scalping."
    },
    {
      id: 5,
      question: "What is Copy Trading and how can I use it?",
      answer: "Copy Trading allows you to automatically replicate the trades of successful traders. You can browse through our marketplace of strategies, view their performance metrics, and choose which ones to follow. You can also set allocation limits to control how much of your capital is used for copy trading."
    },
    {
      id: 6,
      question: "What subscription plans do you offer?",
      answer: "We offer several subscription tiers including Basic, Pro, and Enterprise plans. Each tier provides different levels of access to our tools and features. You can view detailed pricing information in the 'Pricing' section of the dashboard. We also offer custom plans for institutional traders."
    },
    {
      id: 7,
      question: "Is my trading data secure?",
      answer: "Yes, we take security very seriously. All connections are encrypted using industry-standard protocols. We never store your broker passwords, only API keys with the permissions you grant. Our platform undergoes regular security audits and we implement best practices for data protection."
    },
    {
      id: 8,
      question: "How can I create my own trading strategy for others to copy?",
      answer: "To become a strategy provider, navigate to the 'Copy Trading' section and select 'Strategy'. From there, you can create and configure your strategy, set your fee structure, and publish it to the marketplace. You'll need to meet certain performance criteria before your strategy becomes available to others."
    },
    {
      id: 9,
      question: "What kind of support do you offer?",
      answer: "We provide multiple support channels including email support, live chat during business hours, and a comprehensive knowledge base. Premium subscribers also get access to priority support and one-on-one consultation sessions. You can access support directly from the 'Support' section in the dashboard."
    },
    {
      id: 10,
      question: "Can I use the platform on mobile devices?",
      answer: "Yes, our platform is fully responsive and works on mobile devices. While some advanced features work best on desktop, you can monitor your trades, check alerts, and manage your account from any smartphone or tablet. We also offer dedicated mobile apps for iOS and Android with push notifications for trade alerts."
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">Frequently Asked Questions</h1>
      
      <div className="space-y-4">
        {faqItems.map((item) => (
          <div 
            key={item.id} 
            className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900"
          >
            <button
              className="w-full p-4 text-left flex justify-between items-center focus:outline-none"
              onClick={() => toggleItem(item.id)}
            >
              <span className="font-medium text-white">{item.question}</span>
              {expandedItems[item.id] ? (
                <ChevronUp className="w-5 h-5 text-indigo-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-indigo-500" />
              )}
            </button>
            
            {expandedItems[item.id] && (
              <div className="p-4 pt-0 text-zinc-300 border-t border-zinc-800">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}