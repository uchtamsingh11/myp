'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const testimonials = [
  {
    quote:
      'AlgoZ has completely transformed my trading strategy. The automated algorithms have consistently outperformed my manual trading by a significant margin.',
    author: 'Rajesh Sharma',
    title: 'Hedge Fund Manager',
    avatar: '/images/avatar1.png',
    rating: 5,
  },
  {
    quote:
      "As someone who doesn't have time to monitor markets all day, AlgoZ has been a game-changer. The platform is intuitive, and the performance has exceeded my expectations.",
    author: 'Priya Patel',
    title: 'Tech Executive',
    avatar: '/images/avatar2.png',
    rating: 5,
  },
  {
    quote:
      'The risk management features alone are worth the investment. I sleep better knowing my capital is protected by sophisticated algorithms that respond to market conditions 24/7.',
    author: 'Vikram Singh',
    title: 'Professional Trader',
    avatar: '/images/avatar3.png',
    rating: 4,
  },
  {
    quote:
      "I've tried several algo trading platforms, but AlgoZ stands out for its ease of use and transparency. The performance metrics are comprehensive and the results speak for themselves.",
    author: 'Anjali Gupta',
    title: 'Financial Advisor',
    avatar: '/images/avatar4.png',
    rating: 5,
  },
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
      setCurrentIndex(prevIndex => (prevIndex + 1) % testimonials.length);
    }, 7000); // Increased time to 7 seconds for better readability

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = index => {
    setCurrentIndex(index);
  };

  const goToPrev = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % testimonials.length);
  };

  return (
    <section className="py-16 sm:py-24 bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_var(--tw-gradient-stops))] from-transparent via-zinc-900/20 to-transparent"></div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-indigo-600/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-indigo-500/5 rounded-full filter blur-3xl"></div>

      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="section-title">What Our Traders Say</h2>
          <p className="section-subtitle">
            Join thousands of satisfied traders who have elevated their trading with AlgoZ.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative">
            {/* Navigation Arrows - Hidden on mobile */}
            <div className="hidden md:block">
              <button
                onClick={goToPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full p-2 transition-colors backdrop-blur-sm border border-zinc-700/50"
                aria-label="Previous testimonial"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full p-2 transition-colors backdrop-blur-sm border border-zinc-700/50"
                aria-label="Next testimonial"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>

            <div className="h-auto min-h-[280px] sm:min-h-[260px] relative">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className={`absolute inset-0 rounded-xl backdrop-blur-sm transition-all duration-500 ${
                    index === currentIndex
                      ? 'opacity-100 z-10 translate-x-0'
                      : 'opacity-0 z-0 translate-x-8'
                  } p-6 sm:p-8 bg-gradient-to-br from-zinc-900/90 to-zinc-800/70 border border-zinc-700/30`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={index === currentIndex ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <svg
                          className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500/70"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>

                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-400' : 'text-zinc-600'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>

                      <p className="text-base sm:text-lg italic mb-6 leading-relaxed text-zinc-300">
                        {testimonial.quote}
                      </p>
                    </div>

                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center mr-4 shadow-md shadow-indigo-900/20">
                        {/* Placeholder for avatar */}
                        <span className="text-lg font-bold text-white">
                          {testimonial.author.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{testimonial.author}</h4>
                        <p className="text-zinc-400 text-sm">{testimonial.title}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center mt-6 sm:mt-8 items-center">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 mx-1.5 ${
                    index === currentIndex
                      ? 'bg-indigo-500 scale-125'
                      : 'bg-zinc-700 hover:bg-zinc-600'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/50"
            >
              Join Our Traders
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
