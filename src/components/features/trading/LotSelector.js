'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const LotSelector = ({ onSelectLot }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);

  // Generate lot options from 1 to 100
  const generateLotOptions = () => {
    const options = [];
    for (let i = 1; i <= 100; i++) {
      options.push({ id: i.toString(), value: i });
    }
    return options;
  };

  const lotOptions = generateLotOptions();

  const handleSelect = (lot) => {
    setSelectedLot(lot.value);
    if (onSelectLot) {
      onSelectLot(lot.value);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative w-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 border border-purple-800 bg-purple-900 rounded-lg text-white hover:bg-purple-800 transition-colors"
      >
        <span className="truncate">{selectedLot ? `${selectedLot} Lot${selectedLot > 1 ? 's' : ''}` : 'Select Lots'}</span>
        <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {lotOptions.map((lot) => (
              <li key={lot.id}>
                <button
                  onClick={() => handleSelect(lot)}
                  className={`block w-full text-left px-3 py-1.5 text-white hover:bg-zinc-700 transition-colors ${
                    selectedLot === lot.value ? 'bg-purple-700' : ''
                  }`}
                >
                  {lot.value} {lot.value > 1 ? 'Lots' : 'Lot'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LotSelector; 