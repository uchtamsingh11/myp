'use client';

import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 md:pt-24">
      {/* Background gradient with animation */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black"
        animate={{ 
          background: [
            'linear-gradient(to bottom, rgb(24, 24, 27), rgb(0, 0, 0))',
            'linear-gradient(to bottom, rgb(39, 39, 42), rgb(9, 9, 11))',
            'linear-gradient(to bottom, rgb(24, 24, 27), rgb(0, 0, 0))'
          ]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      ></motion.div>
      
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[100px]"
          animate={{
            x: ['-20%', '30%', '-20%'],
            y: ['0%', '40%', '0%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-blue-900/20 blur-[100px]"
          animate={{
            x: ['60%', '10%', '60%'],
            y: ['10%', '40%', '10%'],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-indigo-900/20 blur-[100px]"
          animate={{
            x: ['30%', '70%', '30%'],
            y: ['60%', '20%', '60%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Grid pattern overlay with pulse effect */}
      <motion.div 
        className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center"
        animate={{ opacity: [0.08, 0.12, 0.08] }}
        transition={{ 
          duration: 5, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      ></motion.div>
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Triangle */}
        <motion.div
          className="absolute w-24 h-24 border-2 border-zinc-700/30"
          style={{ 
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          }}
          initial={{ x: '10%', y: '20%', rotate: 0, opacity: 0.2 }}
          animate={{ 
            y: ['20%', '25%', '20%'],
            rotate: [0, 10, 0],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        
        {/* Square */}
        <motion.div
          className="absolute w-16 h-16 border-2 border-zinc-700/30"
          initial={{ x: '80%', y: '30%', rotate: 0, opacity: 0.2 }}
          animate={{ 
            y: ['30%', '35%', '30%'],
            rotate: [0, -15, 0],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        
        {/* Circle */}
        <motion.div
          className="absolute w-20 h-20 rounded-full border-2 border-zinc-700/30"
          initial={{ x: '70%', y: '70%', scale: 1, opacity: 0.2 }}
          animate={{ 
            y: ['70%', '65%', '70%'],
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
      </div>
      
      {/* Enhanced animated particles */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              i % 3 === 0 
                ? "w-1 h-1 bg-blue-500/40" 
                : i % 3 === 1 
                  ? "w-1.5 h-1.5 bg-purple-500/40" 
                  : "w-0.5 h-0.5 bg-zinc-400/60"
            }`}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%", 
              opacity: Math.random() * 0.5 + 0.3,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              x: [
                Math.random() * 100 + "%", 
                Math.random() * 100 + "%", 
                Math.random() * 100 + "%",
                Math.random() * 100 + "%"
              ],
              y: [
                Math.random() * 100 + "%", 
                Math.random() * 100 + "%", 
                Math.random() * 100 + "%",
                Math.random() * 100 + "%"
              ],
              opacity: [0.3, 0.7, 0.5, 0.3],
              scale: [
                Math.random() * 0.5 + 0.5,
                Math.random() * 1 + 0.8,
                Math.random() * 0.5 + 0.5
              ]
            }}
            transition={{ 
              duration: Math.random() * 20 + 15, 
              repeat: Infinity,
              ease: "linear" 
            }}
          />
        ))}
      </div>
      
      <div className="container-custom relative z-10 text-left px-4 md:px-6 pt-12 md:pt-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
            <motion.span 
              className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500 block"
              animate={{ 
                backgroundPosition: ['0% center', '100% center', '0% center'],
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "linear" 
              }}
            >
              AI-Powered Trading, Simplified
            </motion.span>
            <motion.span 
              className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500 block mt-2"
              animate={{ 
                backgroundPosition: ['0% center', '100% center', '0% center'],
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "linear" 
              }}
            >
              -AlgoZ
            </motion.span>
          </h1>
          
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-zinc-400 mb-8 md:mb-10 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Maximize gains and safeguard investments with next-generation algorithmic trading solutions
          </motion.p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <a href="/auth" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                Get Started Now
              </button>
            </a>
            <a href="#features" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-transparent border border-zinc-700 hover:border-zinc-500 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                Explore Features
              </button>
            </a>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 hidden md:block"
        animate={{ 
          y: [0, 10, 0],
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </section>
  );
};

export default Hero;