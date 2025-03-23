'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description: "Sign up in minutes with our streamlined onboarding process. No complicated paperwork required."
  },
  {
    number: "02",
    title: "Connect Your Broker",
    description: "Securely link your existing brokerage account or create a new one through our trusted partners."
  },
  {
    number: "03",
    title: "Select Your Strategy",
    description: "Choose from our library of pre-built algorithms or customize your own trading strategy."
  },
  {
    number: "04",
    title: "Set Risk Parameters",
    description: "Define your risk tolerance and set limits to ensure your capital is protected."
  },
  {
    number: "05",
    title: "Activate & Monitor",
    description: "Launch your algorithm and monitor performance in real-time through our intuitive dashboard."
  }
];

const HowItWorks = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="how-it-works" className="py-24 bg-zinc-950 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,_var(--tw-gradient-stops))] from-transparent via-zinc-900/20 to-transparent"></div>
      
      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">How AlgoZ Works</h2>
          <p className="section-subtitle">
            Getting started with algorithmic trading has never been easier. Follow these simple steps to begin your journey.
          </p>
        </motion.div>
        
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-zinc-800 via-zinc-700 to-zinc-800 transform md:-translate-x-px"></div>
          
          {/* Steps */}
          <div className="space-y-12 md:space-y-0">
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
                  } items-start md:items-center gap-8`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={stepInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Number circle */}
                  <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-14 h-14 rounded-full bg-black border border-zinc-700 flex items-center justify-center z-10">
                    <span className="text-lg font-bold">{step.number}</span>
                  </div>
                  
                  {/* Content */}
                  <div className={`pl-20 md:pl-0 md:w-1/2 ${
                    index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'
                  }`}>
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-zinc-400">{step.description}</p>
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
          className="mt-20 text-center"
        >
          <a href="/auth">
            <button className="btn-primary">Start Your Trading Journey</button>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;