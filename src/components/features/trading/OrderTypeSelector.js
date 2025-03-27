'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const OrderTypeSelector = ({ onSelectOrderType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState('MARKET');

  // Initialize parent component with default value (once on mount)
  React.useEffect(() => {
    if (onSelectOrderType) {
      onSelectOrderType('MARKET');
    }
  }, []);

  const orderTypes = [
    { id: 'LIMIT', name: 'Limit' },
    { id: 'MARKET', name: 'Market' },
  ];

  const handleSelect = orderType => {
    setSelectedOrderType(orderType.id);

    // Notify parent component of the change
    if (onSelectOrderType) {
      onSelectOrderType(orderType.id);
    }

    setIsOpen(false);
  };

  return (
    <div className="relative w-40">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 border border-blue-800 bg-blue-900 rounded-lg text-white hover:bg-blue-800 transition-colors"
      >
        <span className="truncate">
          {selectedOrderType
            ? orderTypes.find(ot => ot.id === selectedOrderType)?.name
            : 'Order Type'}
        </span>
        <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg">
          <ul className="py-1">
            {orderTypes.map(orderType => (
              <li key={orderType.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(orderType)}
                  className={`block w-full text-left px-3 py-1.5 text-white hover:bg-zinc-700 transition-colors ${
                    selectedOrderType === orderType.id ? 'bg-blue-700' : ''
                  }`}
                >
                  {orderType.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OrderTypeSelector;
