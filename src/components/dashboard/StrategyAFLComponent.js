'use client';

import React from 'react';
import { motion } from 'framer-motion';

const StrategyAFLComponent = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">AFL</h2>
      </motion.div>
    </div>
  );
};

export default StrategyAFLComponent;
