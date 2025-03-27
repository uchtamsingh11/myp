'use client';

import React from 'react';
import { motion } from 'framer-motion';

const TradingViewJSONComponent = () => {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-3">JSON Generator</h2>
      </motion.div>
    </div>
  );
};

export default TradingViewJSONComponent;
