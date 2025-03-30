'use client';

import { useState, useEffect } from 'react';

export default function DeveloperProfile() {
  const [countdown, setCountdown] = useState(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  
  const whatsappNumber = "+919876543210"; // Replace with actual WhatsApp number

  const handleBookDeveloper = () => {
    setCountdown(5);
    
    const timer = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(timer);
          setShowWhatsApp(true);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  const formatWhatsAppLink = (number) => {
    // Remove any spaces, dashes, or parentheses
    const cleanNumber = number.replace(/\s+|-|\(|\)/g, '');
    return `https://wa.me/${cleanNumber}?text=Hi, I'm interested in booking a developer for customized strategies.`;
  };

  // Instructions for booking a developer
  const instructions = [
    "You can click on 'Book a Developer' button above to initiate contact.",
    "When you book a developer, you can contact them for your customized strategies.",
    "My developer charges will be upfront 50% and 50% at the time of delivery.",
    "Do not pay developer on their payment handles please."
  ];

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-xl">
          {/* Header Section with Background */}
          <div className="relative h-52 bg-gradient-to-r from-indigo-900 to-purple-900">
            <div className="absolute inset-0 bg-black opacity-60"></div>
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight mb-2">My Developer</h1>
                <p className="text-lg mt-2 text-gray-300">Professional Custom Trading Strategy Development</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            {/* Book Developer Button/WhatsApp Link */}
            <div className="flex justify-center mb-12">
              {!showWhatsApp ? (
                <button
                  onClick={handleBookDeveloper}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium py-3 px-8 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 shadow-lg"
                >
                  {countdown === null ? 'Book a Developer' : `Connecting in ${countdown}...`}
                </button>
              ) : (
                <a
                  href={formatWhatsAppLink(whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white text-lg font-medium py-3 px-8 rounded-lg transition-all transform hover:scale-105 flex items-center shadow-lg"
                >
                  <svg 
                    className="w-6 h-6 mr-2" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.196-.571-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" 
                    />
                  </svg>
                  Chat on WhatsApp
                </a>
              )}
            </div>

            {/* Instructions Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-indigo-400">Important Instructions</h2>
              <div className="bg-zinc-800 rounded-lg p-6 shadow-md">
                <ol className="space-y-4">
                  {instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-indigo-900 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-300">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            
            {/* Service Overview */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-indigo-400">Developer Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-800 rounded-lg p-6 hover:bg-zinc-700 transition-colors">
                  <h3 className="text-xl font-semibold mb-3">Custom Strategy Development</h3>
                  <p className="text-gray-400">Get tailored trading strategies designed to meet your specific trading goals and risk tolerance.</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-6 hover:bg-zinc-700 transition-colors">
                  <h3 className="text-xl font-semibold mb-3">Algorithm Optimization</h3>
                  <p className="text-gray-400">Enhance your existing strategies for better performance and stability in various market conditions.</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-6 hover:bg-zinc-700 transition-colors">
                  <h3 className="text-xl font-semibold mb-3">Pine Script Development</h3>
                  <p className="text-gray-400">Professional Pine Script coding for TradingView with advanced features and optimized performance.</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-6 hover:bg-zinc-700 transition-colors">
                  <h3 className="text-xl font-semibold mb-3">Trading Bot Integration</h3>
                  <p className="text-gray-400">Connect your strategies to execution platforms with reliable automation and safety measures.</p>
                </div>
              </div>
            </div>
            
            {/* Process Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-6 text-indigo-400">Development Process</h2>
              <div className="bg-zinc-800 rounded-lg p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex-1 text-center p-4 border-b md:border-b-0 md:border-r border-zinc-700">
                    <div className="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">01</span>
                    </div>
                    <h3 className="font-semibold mb-2">Consultation</h3>
                    <p className="text-sm text-gray-400">Discuss requirements and strategy specifications</p>
                  </div>
                  <div className="flex-1 text-center p-4 border-b md:border-b-0 md:border-r border-zinc-700">
                    <div className="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">02</span>
                    </div>
                    <h3 className="font-semibold mb-2">Development</h3>
                    <p className="text-sm text-gray-400">Strategy coding and initial testing</p>
                  </div>
                  <div className="flex-1 text-center p-4 border-b md:border-b-0 md:border-r border-zinc-700">
                    <div className="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">03</span>
                    </div>
                    <h3 className="font-semibold mb-2">Optimization</h3>
                    <p className="text-sm text-gray-400">Backtesting and performance tuning</p>
                  </div>
                  <div className="flex-1 text-center p-4">
                    <div className="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">04</span>
                    </div>
                    <h3 className="font-semibold mb-2">Delivery</h3>
                    <p className="text-sm text-gray-400">Implementation and documentation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 