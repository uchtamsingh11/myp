'use client';

import React from 'react';
import { motion } from 'framer-motion';

const ScalpingToolManageComponent = () => {
  const handleRedirect = () => {
    window.open('/scalping-tool', '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <h2 className="text-2xl font-bold mb-6">Scalping Tool: Choose your broker</h2>
        <button 
          onClick={handleRedirect}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <span>Redirect</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </motion.div>
    </div>
  );
};

export default ScalpingToolManageComponent; 