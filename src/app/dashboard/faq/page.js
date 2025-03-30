'use client';

import { useState } from 'react';

export default function FAQPage() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleQuestion = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  const faqs = [
    {
      question: "What is AlgoZ?",
      answer: "AlgoZ is an advanced algorithmic trading platform that enables users to automate their trading strategies across various markets including stocks, forex, and cryptocurrencies. Our platform provides tools for creating, testing, and deploying trading algorithms without requiring extensive coding knowledge."
    },
    {
      question: "Do I need coding experience to use AlgoZ?",
      answer: "No, you don't need coding experience to use AlgoZ. Our platform provides intuitive interfaces and tools that allow users to create trading strategies using visual builders. However, for advanced users, we do offer options to write custom code in Pine Script, MQL, or other languages."
    },
    {
      question: "Which markets can I trade with AlgoZ?",
      answer: "AlgoZ supports trading in multiple markets including NSE/BSE (Indian stock markets), US stocks, forex, and cryptocurrencies. The available markets depend on which brokers you connect to our platform."
    },
    {
      question: "How do I connect my broker to AlgoZ?",
      answer: "You can connect your broker through the Broker Auth section in the dashboard. We support major brokers through API integrations. Simply navigate to the Broker Auth page, select your broker, and follow the authentication steps to connect your trading account."
    },
    {
      question: "Is my trading data secure?",
      answer: "Yes, security is our priority. We use industry-standard encryption, secure API connections, and don't store your broker passwords. All connections to brokers are made through official APIs with proper authentication protocols and your personal data is protected according to strict privacy policies."
    },
    {
      question: "What is copy trading and how does it work?",
      answer: "Copy trading allows you to automatically replicate the trades of experienced traders. In AlgoZ, you can browse successful strategies in our marketplace and set up your account to copy their trades in real-time with your chosen risk parameters."
    },
    {
      question: "What is the Trading View feature?",
      answer: "The Trading View feature in AlgoZ provides advanced charting capabilities integrated with automation features. You can create custom indicators, set up alerts, and connect directly to your trading strategies. This feature acts as your command center for technical analysis and trade execution."
    },
    {
      question: "How does backtesting work in AlgoZ?",
      answer: "Backtesting allows you to test your trading strategies against historical market data to evaluate their potential performance. Our platform provides comprehensive backtesting tools with detailed metrics including profit/loss, drawdown, win rate, and risk-adjusted returns to help refine your strategies before deploying them in live markets."
    },
    {
      question: "What is the Scalping Tool and how does it work?",
      answer: "The Scalping Tool is designed for short-term traders who make quick trades to capitalize on small price movements. It provides specialized features like rapid order execution, tight spread monitoring, and quick position management specifically optimized for scalping strategies."
    },
    {
      question: "Can I use AlgoZ on my mobile device?",
      answer: "Yes, AlgoZ is fully responsive and works on mobile devices through your browser. We're also developing dedicated mobile apps for iOS and Android to provide an even better experience for traders on the go."
    },
    {
      question: "What are the costs associated with using AlgoZ?",
      answer: "AlgoZ offers various subscription plans tailored to different trader needs. You can find detailed pricing information on our Pricing page. We offer basic free plans as well as premium subscriptions with advanced features. Note that broker commissions and fees are separate from AlgoZ subscription costs."
    },
    {
      question: "How do I optimize my trading strategies?",
      answer: "AlgoZ provides robust optimization tools that allow you to test multiple parameter combinations to find the optimal settings for your strategy. You can define parameter ranges and our system will automatically test variations to identify the best performing configurations based on your selected metrics."
    },
    {
      question: "What is the Marketplace in AlgoZ?",
      answer: "The Marketplace is where users can browse, purchase, and sell trading strategies and indicators. You can find proven strategies developed by other traders, or if you've created a successful strategy, you can list it for sale and earn income when other traders purchase it."
    },
    {
      question: "How does the My Developer feature work?",
      answer: "My Developer is our platform for connecting with professional trading strategy developers. If you have a trading idea but lack the technical skills to implement it, you can hire experienced developers through our platform who will build custom strategies according to your specifications."
    },
    {
      question: "Can I use AlgoZ for paper trading before using real money?",
      answer: "Absolutely. AlgoZ provides paper trading capabilities that allow you to test your strategies in real-time market conditions without risking actual money. This is an excellent way to gain confidence in your strategies before deploying them with real capital."
    },
    {
      question: "What risk management features does AlgoZ offer?",
      answer: "AlgoZ includes comprehensive risk management tools such as stop-loss and take-profit settings, position sizing calculators, maximum drawdown controls, and daily loss limits. These features help you protect your capital and trade according to sound risk management principles."
    },
    {
      question: "How can I integrate external data sources into my strategies?",
      answer: "AlgoZ allows integration of external data sources through our API connections. You can incorporate fundamental data, economic indicators, alternative data, and other sources to enhance your trading strategies and create more sophisticated algorithms."
    },
    {
      question: "Is AlgoZ suitable for beginners in trading?",
      answer: "Yes, AlgoZ is designed with both beginners and experienced traders in mind. We provide educational resources, intuitive interfaces, and pre-built strategy templates to help beginners get started. Our platform grows with you as you develop more trading expertise."
    },
    {
      question: "What customer support options are available?",
      answer: "We offer multiple support channels including email support, live chat, and ticket submission through our Support page. Premium users also have access to priority support and dedicated account managers depending on their subscription level."
    },
    {
      question: "Can I run multiple strategies simultaneously?",
      answer: "Yes, AlgoZ allows you to run multiple strategies simultaneously across different markets and timeframes. Our system efficiently manages these concurrent strategies, allowing for portfolio diversification and more stable overall returns."
    },
    {
      question: "How does AlgoZ handle market data and connectivity issues?",
      answer: "AlgoZ has built-in redundancy systems to minimize disruptions. We use multiple data providers for reliable market data and have failover mechanisms in place. In case of connectivity issues, the platform has safeguards to pause trading or execute predefined contingency plans."
    },
    {
      question: "Can I export my trading results and performance metrics?",
      answer: "Yes, AlgoZ provides comprehensive export options for your trading results and performance metrics. You can download reports in various formats (CSV, PDF, Excel) for record-keeping, tax purposes, or further analysis in external tools."
    },
    {
      question: "What types of orders does AlgoZ support?",
      answer: "AlgoZ supports a wide range of order types including market orders, limit orders, stop orders, trailing stops, OCO (One-Cancels-Other), and more advanced conditional orders. The available order types may vary depending on your connected broker's capabilities."
    },
    {
      question: "How often are new features added to AlgoZ?",
      answer: "We have a regular development cycle with updates typically released every 2-4 weeks. Major feature additions are generally introduced quarterly. We actively incorporate user feedback into our development roadmap to continuously improve the platform."
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer: "Yes, you can cancel your subscription at any time through your account settings. When you cancel, you'll continue to have access to your current subscription level until the end of your billing period. We don't offer partial refunds for unused subscription time."
    }
  ];

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8 text-white">Frequently Asked Questions</h1>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-zinc-800 rounded-lg overflow-hidden">
            <button
              className="w-full p-4 text-left bg-zinc-900 hover:bg-zinc-800 transition-colors flex justify-between items-center"
              onClick={() => toggleQuestion(index)}
            >
              <span className="font-semibold text-white">{faq.question}</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  expandedIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expandedIndex === index && (
              <div className="p-4 bg-zinc-800 text-zinc-300">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 