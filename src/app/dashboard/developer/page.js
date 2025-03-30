'use client';

import { useState } from 'react';
import { MessageCircle, Calendar, Code, Settings, PieChart, BarChart2, Check, ArrowRight, Monitor, Cpu, Rocket, Zap } from 'lucide-react';

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

  // Services with icons
  const services = [
    {
      title: "Custom Strategy Development",
      description: "Get tailored trading strategies designed to meet your specific trading goals and risk tolerance.",
      icon: <Code className="w-6 h-6 text-indigo-400" />
    },
    {
      title: "Algorithm Optimization",
      description: "Enhance your existing strategies for better performance and stability in various market conditions.",
      icon: <Settings className="w-6 h-6 text-indigo-400" />
    },
    {
      title: "Pine Script Development",
      description: "Professional Pine Script coding for TradingView with advanced features and optimized performance.",
      icon: <PieChart className="w-6 h-6 text-indigo-400" />
    },
    {
      title: "Trading Bot Integration",
      description: "Connect your strategies to execution platforms with reliable automation and safety measures.",
      icon: <Cpu className="w-6 h-6 text-indigo-400" />
    }
  ];

  // Development process steps
  const processSteps = [
    {
      step: "01",
      title: "Consultation",
      description: "Discuss requirements and strategy specifications",
      icon: <MessageCircle className="w-5 h-5 text-white" />
    },
    {
      step: "02",
      title: "Development",
      description: "Strategy coding and initial testing",
      icon: <Code className="w-5 h-5 text-white" />
    },
    {
      step: "03",
      title: "Optimization",
      description: "Backtesting and performance tuning",
      icon: <BarChart2 className="w-5 h-5 text-white" />
    },
    {
      step: "04",
      title: "Delivery",
      description: "Implementation and documentation",
      icon: <Rocket className="w-5 h-5 text-white" />
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-zinc-900 via-indigo-900/30 to-zinc-900 rounded-xl overflow-hidden border border-indigo-500/20 shadow-2xl">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute right-0 bottom-0 transform translate-x-1/3 translate-y-1/4">
              <div className="w-96 h-96 rounded-full bg-indigo-500/30 filter blur-3xl"></div>
            </div>
            <div className="absolute left-20 top-20">
              <div className="w-40 h-40 rounded-full bg-purple-500/20 filter blur-3xl"></div>
            </div>
          </div>
          
          <div className="relative z-10 px-8 py-16 text-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 mb-4">Expert Developer Services</h1>
            <p className="text-zinc-300 text-lg max-w-2xl mx-auto mb-10">Professional custom trading strategy development for Indian markets</p>
            
            <div className="flex justify-center mb-8">
              {!showWhatsApp ? (
                <button
                  onClick={handleBookDeveloper}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-medium py-3 px-8 rounded-lg transition-all hover:shadow-lg hover:shadow-indigo-500/20 flex items-center gap-2"
                >
                  {countdown === null ? (
                    <>
                      Book a Developer <Calendar className="w-5 h-5 ml-1" />
                    </>
                  ) : (
                    <>
                      Connecting in {countdown}... <Monitor className="w-5 h-5 ml-1 animate-pulse" />
                    </>
                  )}
                </button>
              ) : (
                <a
                  href={formatWhatsAppLink(whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-500 text-white text-lg font-medium py-3 px-8 rounded-lg transition-all hover:shadow-lg hover:shadow-green-500/20 flex items-center gap-2"
                >
                  <svg 
                    className="w-6 h-6" 
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
            
            {/* Featured benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 flex flex-col items-center">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-white font-medium mb-1">Fast Delivery</h3>
                <p className="text-zinc-400 text-sm text-center">Quick turnaround on custom strategies</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 flex flex-col items-center">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mb-3">
                  <Settings className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-white font-medium mb-1">Expert Optimization</h3>
                <p className="text-zinc-400 text-sm text-center">Strategies tailored for Indian markets</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 flex flex-col items-center">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mb-3">
                  <Check className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-white font-medium mb-1">Guaranteed Results</h3>
                <p className="text-zinc-400 text-sm text-center">Thoroughly tested before delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-700/50 flex items-center">
          <Calendar className="w-5 h-5 text-indigo-500 mr-2" />
          <h2 className="text-white text-xl font-semibold">Important Instructions</h2>
        </div>
        <div className="p-6">
          <ol className="space-y-4">
            {instructions.map((instruction, index) => (
              <li key={index} className="flex items-start">
                <div className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-full w-7 h-7 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-zinc-300">{instruction}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      {/* Service Overview */}
      <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-700/50 flex items-center">
          <Code className="w-5 h-5 text-indigo-500 mr-2" />
          <h2 className="text-white text-xl font-semibold">Developer Services</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <div key={index} className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700/50 hover:border-indigo-500/50 transition-all group">
                <div className="flex items-start">
                  <div className="mt-1 mr-4">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-medium mb-2 group-hover:text-indigo-400 transition-colors">{service.title}</h3>
                    <p className="text-zinc-400">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Process Section */}
      <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-700/50 flex items-center">
          <ArrowRight className="w-5 h-5 text-indigo-500 mr-2" />
          <h2 className="text-white text-xl font-semibold">Development Process</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700/50 h-full flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <div className="text-indigo-400 font-bold mb-1">{step.step}</div>
                  <h3 className="text-white font-medium mb-2">{step.title}</h3>
                  <p className="text-zinc-400 text-sm">{step.description}</p>
                </div>
                
                {/* Connector line between steps */}
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-indigo-600/30 z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-zinc-900 via-indigo-900/30 to-zinc-900 rounded-xl overflow-hidden border border-indigo-500/20 shadow-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Build Your Custom Strategy?</h2>
        <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
          Get started today and transform your trading ideas into powerful algorithms
        </p>
        
        {!showWhatsApp ? (
          <button
            onClick={handleBookDeveloper}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-8 rounded-lg transition-all inline-flex items-center gap-2"
          >
            {countdown === null ? 'Book a Developer Now' : `Connecting in ${countdown}...`}
          </button>
        ) : (
          <a
            href={formatWhatsAppLink(whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-500 text-white font-medium py-3 px-8 rounded-lg transition-all inline-flex items-center gap-2"
          >
            <svg 
              className="w-5 h-5" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.196-.571-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" 
              />
            </svg>
            Contact Developer
          </a>
        )}
      </div>
    </div>
  );
} 