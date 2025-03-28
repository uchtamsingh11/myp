'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  // Set document title on component mount
  useEffect(() => {
    document.title = 'FAQ | AlgoZ';
  }, []);
  
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
    },
    {
      id: 11,
      question: "What markets can I trade with your platform?",
      answer: "Our platform supports trading across multiple markets including forex, stocks, cryptocurrencies, commodities, and indices. The specific markets available depend on your broker's offerings and your subscription tier. You can view all supported markets in the 'Symbol' section under Trading View."
    },
    {
      id: 12,
      question: "How do I set up automated trading?",
      answer: "To set up automated trading, first connect your broker account through Broker Auth. Then, navigate to the Trading View section and set up your webhook URL. You can create trading strategies using TradingView's Pine Script or use our JSON Generator to create custom alert messages. Finally, set up alerts in TradingView that will trigger trades on our platform."
    },
    {
      id: 13,
      question: "What risk management features do you offer?",
      answer: "We offer comprehensive risk management features including position sizing calculators, stop-loss and take-profit automation, maximum drawdown settings, and daily loss limits. You can configure these settings globally or per strategy in the respective tool sections. Premium users also get access to advanced risk analytics and portfolio correlation tools."
    },
    {
      id: 14,
      question: "How do I track my trading performance?",
      answer: "You can track your trading performance through our detailed analytics dashboard. We provide metrics such as win rate, profit factor, average win/loss, maximum drawdown, and Sharpe ratio. You can view performance by time period, strategy, or market. All trades are logged and can be exported for further analysis or tax reporting."
    },
    {
      id: 15,
      question: "Can I use multiple broker accounts simultaneously?",
      answer: "Yes, you can connect multiple broker accounts to our platform and manage them all from a single dashboard. This allows you to diversify your trading across different brokers or to separate different trading strategies. Each broker connection can be individually configured with its own risk parameters and trading permissions."
    },
    {
      id: 16,
      question: "What happens if my internet connection drops during trading?",
      answer: "Our platform includes failsafe mechanisms for internet disruptions. For automated trading, our servers continue to monitor and execute your strategies even if your local connection drops. For manual trading, we offer order persistence where pending orders remain active on our servers. Additionally, you can set up SMS or email notifications for critical events."
    },
    {
      id: 17,
      question: "How do I customize the trading interface?",
      answer: "You can customize the trading interface through the settings menu in each tool section. Options include dark/light themes, chart preferences, hotkey configurations, and widget layouts. Premium users can create and save multiple workspace configurations for different trading scenarios or strategies."
    },
    {
      id: 18,
      question: "Do you offer backtesting capabilities?",
      answer: "Yes, we offer comprehensive backtesting tools that allow you to test your strategies against historical market data. You can adjust parameters such as time period, tick data quality, and slippage assumptions. Backtesting reports include detailed performance metrics and visualizations to help you refine your strategies before deploying them in live markets."
    },
    {
      id: 19,
      question: "What educational resources do you provide?",
      answer: "We provide extensive educational resources including video tutorials, strategy guides, market analysis, and webinars. Our knowledge base covers everything from platform basics to advanced trading concepts. Premium subscribers also get access to exclusive educational content and one-on-one coaching sessions with experienced traders."
    },
    {
      id: 20,
      question: "How often do you update the platform?",
      answer: "We release major updates quarterly and minor updates monthly. Updates include new features, performance improvements, and security enhancements. We maintain a public roadmap of upcoming features and prioritize development based on user feedback. All updates are announced in advance through our newsletter and in-platform notifications."
    },
    {
      id: 21,
      question: "Can I use third-party indicators and tools with your platform?",
      answer: "Yes, our platform supports integration with many third-party indicators and tools. For TradingView, you can use any custom indicator or strategy written in Pine Script. We also provide APIs for developers to create custom integrations. Additionally, we have partnerships with several popular indicator providers for seamless integration."
    },
    {
      id: 22,
      question: "What are the hardware requirements for running your platform?",
      answer: "Our platform is cloud-based and runs in your browser, so the hardware requirements are minimal. We recommend a computer with at least 4GB of RAM, a modern processor, and a stable internet connection. For the best experience with multiple charts and real-time data, 8GB of RAM or more is recommended. Our mobile apps are optimized to run efficiently on most smartphones and tablets."
    },
    {
      id: 23,
      question: "How do you handle market data and is there any latency?",
      answer: "We source market data directly from exchanges and liquidity providers to ensure accuracy. Our infrastructure is optimized for low latency with servers located in key financial centers around the world. Premium users get access to higher-frequency data feeds and dedicated connections. Typical latency is under 100ms for standard users and under 20ms for premium users."
    },
    {
      id: 24,
      question: "Can I share my strategies with friends or colleagues?",
      answer: "Yes, you can share your strategies with others through our sharing feature. You can generate a shareable link with customizable permissions (view-only or editable). For more formal collaboration, our Team accounts allow multiple users to work on the same strategies with role-based access controls and activity logs."
    },
    {
      id: 25,
      question: "What happens to my account if I decide to cancel my subscription?",
      answer: "If you cancel your subscription, you'll maintain access until the end of your current billing period. After that, your account will be downgraded to our free tier with limited features. Your data and configurations will be preserved for 90 days, during which time you can reactivate your subscription to regain full access. After 90 days, inactive data may be archived."
    }
  ];

  return (
    <div className="p-4 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Frequently Asked Questions</h1>
        <p className="text-zinc-400 mt-1">Find answers to common questions about our trading platform</p>
      </div>
      
      <div className="space-y-4">
        {faqItems.map((item) => (
          <div 
            key={item.id} 
            className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900 shadow-lg"
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