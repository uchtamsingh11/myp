'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const StrikeSelector = ({ type, onSelectStrike }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStrike, setSelectedStrike] = useState(null);

  // Generate mock strike prices (in real app, these would come from an API)
  const generateStrikes = () => {
    const baseStrike = 21000;
    const strikes = [];
    
    for (let i = -10; i <= 10; i++) {
      const strikePrice = baseStrike + (i * 100);
      strikes.push({ id: strikePrice.toString(), price: strikePrice });
    }
    
    return strikes;
  };

  const strikes = generateStrikes();

  const handleSelect = (strike) => {
    setSelectedStrike(strike.price);
    if (onSelectStrike) {
      onSelectStrike(strike.price);
    }
    setIsOpen(false);
  };

  const label = type === 'call' ? 'Select Call Strike' : 'Select Put Strike';
  const bgColor = type === 'call' ? 'bg-green-900' : 'bg-red-900';
  const borderColor = type === 'call' ? 'border-green-800' : 'border-red-800';
  const hoverColor = type === 'call' ? 'hover:bg-green-800' : 'hover:bg-red-800';
  const selectedBgColor = type === 'call' ? 'bg-green-700' : 'bg-red-700';

  return (
    <div className="relative w-48">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg text-white transition-colors ${bgColor} ${borderColor} ${hoverColor}`}
      >
        <span className="truncate">{selectedStrike ? selectedStrike : label}</span>
        <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {strikes.map((strike) => (
              <li key={strike.id}>
                <button
                  onClick={() => handleSelect(strike)}
                  className={`block w-full text-left px-3 py-1.5 text-white hover:bg-zinc-700 transition-colors ${
                    selectedStrike === strike.price ? selectedBgColor : ''
                  }`}
                >
                  {strike.price}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StrikeSelector; 