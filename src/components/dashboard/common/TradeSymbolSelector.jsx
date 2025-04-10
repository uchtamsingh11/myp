import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel
} from '../../ui/tooltips/select';

// Constants for trade symbols
const TRADE_SYMBOLS = [
  { value: 'AAPL', label: 'AAPL (Apple Inc.)' },
  { value: 'MSFT', label: 'MSFT (Microsoft Corp.)' },
  { value: 'GOOGL', label: 'GOOGL (Alphabet Inc.)' },
  { value: 'AMZN', label: 'AMZN (Amazon.com Inc.)' },
  { value: 'TSLA', label: 'TSLA (Tesla Inc.)' },
  { value: 'BTCUSD', label: 'BTCUSD (Bitcoin)' },
  { value: 'ETHUSD', label: 'ETHUSD (Ethereum)' },
  { value: 'EURUSD', label: 'EURUSD (Euro/USD)' },
  // Add more trading symbols as needed
  { value: 'META', label: 'META (Meta Platforms Inc.)' },
  { value: 'NFLX', label: 'NFLX (Netflix Inc.)' },
  { value: 'NVDA', label: 'NVDA (NVIDIA Corp.)' },
  { value: 'PYPL', label: 'PYPL (PayPal Holdings Inc.)' },
  { value: 'ADBE', label: 'ADBE (Adobe Inc.)' },
  { value: 'LTCUSD', label: 'LTCUSD (Litecoin)' },
  { value: 'XRPUSD', label: 'XRPUSD (Ripple)' },
  { value: 'DOTUSD', label: 'DOTUSD (Polkadot)' },
  { value: 'JPYUSD', label: 'JPYUSD (Japanese Yen/USD)' },
  { value: 'GBPUSD', label: 'GBPUSD (British Pound/USD)' }
];

// Group symbols by type
const SYMBOL_GROUPS = {
  stocks: [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA', 'PYPL', 'ADBE'
  ],
  crypto: [
    'BTCUSD', 'ETHUSD', 'LTCUSD', 'XRPUSD', 'DOTUSD'
  ],
  forex: [
    'EURUSD', 'JPYUSD', 'GBPUSD'
  ]
};

/**
 * TradeSymbolSelector component for selecting trading symbols
 * @param {Object} props Component props
 * @param {string} props.value Current selected symbol value
 * @param {function} props.onChange Function to call when selection changes
 * @param {string} props.id HTML id for the select element
 * @param {boolean} props.required If true, the field is required
 * @param {string} props.label Label text for the select
 * @param {string} props.className Additional CSS class for the container
 * @param {string} props.selectClassName Additional CSS class for the select element
 */
const TradeSymbolSelector = ({
  value,
  onChange,
  id = 'symbol',
  required = false,
  label = 'Trading Symbol',
  className = '',
  selectClassName = ''
}) => {
  // Handle value change to match onChange signature expected by parent components
  const handleValueChange = (newValue) => {
    // Create a synthetic event object to match the expected interface
    const syntheticEvent = {
      target: {
        value: newValue
      }
    };
    onChange(syntheticEvent);
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-2 text-zinc-300">
          {label}
        </label>
      )}
      <Select 
        value={value} 
        onValueChange={handleValueChange}
        required={required}
      >
        <SelectTrigger 
          id={id}
          className={`px-4 py-3 h-auto bg-zinc-800/80 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${selectClassName}`}
        >
          <SelectValue placeholder="Select a symbol" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border border-zinc-700 text-white">
          <SelectGroup>
            <SelectLabel className="text-zinc-400">Stocks</SelectLabel>
            {TRADE_SYMBOLS.filter(symbol => SYMBOL_GROUPS.stocks.includes(symbol.value)).map(symbol => (
              <SelectItem 
                key={symbol.value} 
                value={symbol.value}
                className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
              >
                {symbol.label}
              </SelectItem>
            ))}
          </SelectGroup>
          
          <SelectGroup>
            <SelectLabel className="text-zinc-400">Cryptocurrencies</SelectLabel>
            {TRADE_SYMBOLS.filter(symbol => SYMBOL_GROUPS.crypto.includes(symbol.value)).map(symbol => (
              <SelectItem 
                key={symbol.value} 
                value={symbol.value}
                className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
              >
                {symbol.label}
              </SelectItem>
            ))}
          </SelectGroup>
          
          <SelectGroup>
            <SelectLabel className="text-zinc-400">Forex</SelectLabel>
            {TRADE_SYMBOLS.filter(symbol => SYMBOL_GROUPS.forex.includes(symbol.value)).map(symbol => (
              <SelectItem 
                key={symbol.value} 
                value={symbol.value}
                className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
              >
                {symbol.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

// Export both the component and the symbols list for usage elsewhere
export { TRADE_SYMBOLS };
export default TradeSymbolSelector; 