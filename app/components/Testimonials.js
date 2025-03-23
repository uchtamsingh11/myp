'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const testimonials = [
  {
    quote: "AlgoZ has completely transformed my trading strategy. The automated algorithms have consistently outperformed my manual trading by a significant margin.",
    author: "Rajesh Sharma",
    title: "Hedge Fund Manager",
    avatar: "/images/avatar1.png"
  },
  {
    quote: "As someone who doesn't have time to monitor markets all day, AlgoZ has been a game-changer. The platform is intuitive, and the performance has exceeded my expectations.",
    author: "Priya Patel",
    title: "Tech Executive",
    avatar: "/images/avatar2.png"
  },
  {
    quote: "The risk management features alone are worth the investment. I sleep better knowing my capital is protected by sophisticated algorithms that respond to market conditions 24/7.",
    author: "Vikram Singh",
    title: "Professional Trader",
    avatar: "/images/avatar3.png"
  },
  {
    quote: "I've tried several algo trading platforms, but AlgoZ stands out for its ease of use and transparency. The performance metrics are comprehensive and the results speak for themselves.",
    author: "Anjali Gupta",
    title: "Financial Advisor",
    avatar: "/images/avatar4.png"
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-24 bg-zinc-950 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_var(--tw-gradient-stops))] from-transparent via-zinc-900/20 to-transparent"></div>
      
      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">What Our Traders Say</h2>
          <p className="section-subtitle">
            Join thousands of satisfied traders who have elevated their trading with AlgoZ.
          </p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative h-[400px] md:h-[300px]">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className={`absolute inset-0 card p-8 flex flex-col justify-between transition-opacity duration-500 ${
                  index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={index === currentIndex ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <div>
                  <svg className="w-10 h-10 text-zinc-700 mb-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-xl italic mb-6">{testimonial.quote}</p>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mr-4">
                    {/* Placeholder for avatar */}
                    <span className="text-lg font-bold">{testimonial.author.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.author}</h4>
                    <p className="text-zinc-400 text-sm">{testimonial.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentIndex ? 'bg-white' : 'bg-zinc-700'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;