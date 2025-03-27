'use client';

import React from 'react';
import { motion } from 'framer-motion';

const CopyTradingManageComponent = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">Copy Trading: Choose your broker</h2>
      </motion.div>
    </div>
  );
};

export default CopyTradingManageComponent;
