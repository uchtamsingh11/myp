'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description: "Sign up in minutes with our streamlined onboarding process. No complicated paperwork required.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    number: "02",
    title: "Connect Your Broker",
    description: "Securely link your existing brokerage account or create a new one through our trusted partners.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    )
  },
  {
    number: "03",
    title: "Select Your Strategy",
    description: "Choose from our library of pre-built algorithms or customize your own trading strategy.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  },
  {
    number: "04",
    title: "Set Risk Parameters",
    description: "Define your risk tolerance and set limits to ensure your capital is protected.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  },
  {
    number: "05",
    title: "Activate & Monitor",
    description: "Launch your algorithm and monitor performance in real-time through our intuitive dashboard.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  }
];

const HowItWorks = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-zinc-950 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-40 left-0 w-96 h-96 bg-indigo-900/10 rounded-full filter blur-3xl opacity-50"></div>
      <div className="absolute bottom-40 right-0 w-96 h-96 bg-indigo-900/10 rounded-full filter blur-3xl opacity-50"></div>
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,_var(--tw-gradient-stops))] from-transparent via-zinc-900/20 to-transparent"></div>
      
      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="section-title">How AlgoZ Works</h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            Getting started with algorithmic trading has never been easier. Follow these simple steps to begin your journey.
          </p>
        </motion.div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          {/* Connecting line */}
          <div className="absolute left-8 sm:left-12 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-900/30 via-indigo-600/40 to-indigo-900/30 rounded-full transform md:-translate-x-px"></div>
          
          {/* Steps */}
          <div className="space-y-16 md:space-y-24">
            {steps.map((step, index) => {
              const [stepRef, stepInView] = useInView({
                triggerOnce: true,
                threshold: 0.1,
              });
              
              return (
                <motion.div
                  key={index}
                  ref={stepRef}
                  className={`relative flex flex-col md:flex-row ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } items-start gap-6 md:gap-8`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={stepInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Number circle */}
                  <div className="absolute left-8 sm:left-12 md:left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-800/80 to-indigo-900/80 flex items-center justify-center z-10 border-2 border-indigo-600/30 shadow-lg shadow-indigo-900/30">
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">{step.number}</span>
                  </div>
                  
                  {/* Content */}
                  <div className={`pl-24 sm:pl-32 md:pl-0 md:w-1/2 ${
                    index % 2 === 0 
                      ? 'md:pr-16 lg:pr-24 md:text-right' 
                      : 'md:pl-16 lg:pl-24 md:text-left'
                  } group`}>
                    <div className={`inline-flex items-center mb-3 ${
                      index % 2 === 0 ? 'md:flex-row-reverse' : ''
                    }`}>
                      <div className={`hidden md:flex items-center justify-center w-12 h-12 rounded-lg bg-zinc-800/80 ${
                        index % 2 === 0 ? 'ml-4' : 'mr-4'
                      } transform transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-800/30 group-hover:text-indigo-400`}>
                        {step.icon}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300">{step.title}</h3>
                    </div>
                    <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">{step.description}</p>
                  </div>
                  
                  {/* Empty space for alignment */}
                  <div className="hidden md:block md:w-1/2"></div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 md:mt-24 text-center"
        >
          <a href="/auth" className="inline-block">
            <button className="relative overflow-hidden px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/50 transition-all duration-300 hover:translate-y-[-3px] group">
              <span className="relative z-10 flex items-center">
                Start Your Trading Journey
                <svg className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </a>
          <p className="mt-4 text-zinc-500 text-sm">No credit card required to get started</p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;