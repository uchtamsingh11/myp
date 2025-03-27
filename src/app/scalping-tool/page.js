'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StockChart from '../components/StockChart';
import IndexSelector from '../components/IndexSelector';
import StrikeSelector from '../components/StrikeSelector';
import LotSelector from '../components/LotSelector';
import OrderTypeSelector from '../components/OrderTypeSelector';

export default function ScalpingToolPage() {
  const [selectedIndex, setSelectedIndex] = useState('NIFTY'); // Default index
  const [selectedCallStrike, setSelectedCallStrike] = useState(null);
  const [selectedPutStrike, setSelectedPutStrike] = useState(null);
  const [selectedLot, setSelectedLot] = useState(null);
  const [selectedOrderType, setSelectedOrderType] = useState('MARKET'); // Default to MARKET
  const [limitPrice, setLimitPrice] = useState(''); // New state for limit price
  
  // Ensure selectedOrderType is initialized to MARKET
  React.useEffect(() => {
    setSelectedOrderType('MARKET');
  }, []);
  
  const handleSelectIndex = (indexId) => {
    setSelectedIndex(indexId);
  };
  
  const handleSelectCallStrike = (strike) => {
    setSelectedCallStrike(strike);
  };
  
  const handleSelectPutStrike = (strike) => {
    setSelectedPutStrike(strike);
  };
  
  const handleSelectLot = (lot) => {
    setSelectedLot(lot);
  };
  
  const handleSelectOrderType = (orderType) => {
    console.log('Order type changed to:', orderType); // Debug
    
    // Update the order type state
    setSelectedOrderType(orderType);
    
    // Reset limit price when changing to MARKET
    if (orderType !== 'LIMIT') {
      setLimitPrice('');
    }
  };
  
  const handleLimitPriceChange = (e) => {
    // Allow only numbers and decimal point
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setLimitPrice(value);
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content Area */}
      <main className="p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pl-4"
        >
          <h1 className="text-3xl font-bold">Scalping Tool</h1>
          
          {/* Selectors */}
          <div className="mt-4 mb-4 flex flex-wrap gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <IndexSelector onSelectIndex={handleSelectIndex} />
            </div>
            
            <div className="flex items-center flex-wrap gap-3">
              <StrikeSelector type="call" onSelectStrike={handleSelectCallStrike} />
              <StrikeSelector type="put" onSelectStrike={handleSelectPutStrike} />
              <LotSelector onSelectLot={handleSelectLot} />
              <OrderTypeSelector onSelectOrderType={handleSelectOrderType} />
              
              {/* Limit Price Input - Only show when LIMIT is selected */}
              {selectedOrderType === 'LIMIT' ? (
                <div className="relative w-40">
                  <div className="text-xs text-yellow-300 mb-1 ml-1">Limit Price</div>
                  <input
                    type="text"
                    value={limitPrice}
                    onChange={handleLimitPriceChange}
                    placeholder="Enter price"
                    className="w-full px-3 py-2 border border-yellow-600 bg-yellow-900/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              ) : null}
            </div>
          </div>
          
          {/* Stock Market Chart using Chart.js */}
          <div className="mt-2 w-full pr-4">
            <StockChart selectedIndex={selectedIndex} />
          </div>
        </motion.div>
      </main>
    </div>
  );
} 