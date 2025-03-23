'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const IndexSelector = ({ onSelectIndex }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const indices = [
    { id: 'NIFTY', name: 'NIFTY' },
    { id: 'BANKNIFTY', name: 'BANKNIFTY' },
    { id: 'FINNIFTY', name: 'FINNIFTY' },
    { id: 'SENSEX', name: 'SENSEX' },
    { id: 'BANKEX', name: 'BANKEX' },
    { id: 'MIDCAPNIFTY', name: 'MIDCAPNIFTY' },
  ];

  const handleSelect = (index) => {
    setSelectedIndex(index.name);
    onSelectIndex(index.id);
    setIsOpen(false);
  };

  return (
    <div className="relative w-64">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white hover:bg-zinc-700 transition-colors"
      >
        <span>{selectedIndex || "Select Index"}</span>
        <ChevronDown className="h-4 w-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg">
          <ul className="py-1">
            {indices.map((index) => (
              <li key={index.id}>
                <button
                  onClick={() => handleSelect(index)}
                  className="block w-full text-left px-4 py-2 text-white hover:bg-zinc-700 transition-colors"
                >
                  {index.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default IndexSelector; 