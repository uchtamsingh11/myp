'use client';

import React from 'react';
import { motion } from 'framer-motion';

const StrategyPineScriptComponent = () => {
  return (
    <div className="mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">Pine Script</h2>
      </motion.div>
    </div>
  );
};

export default StrategyPineScriptComponent;
