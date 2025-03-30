'use client';

import { useState } from 'react';

export default function OptimizationPage() {
  const [pineScript, setPineScript] = useState('');
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('1D');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [jsonData, setJsonData] = useState(null);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = () => {
    if (!pineScript.trim()) {
      alert('Please enter Pine Script code');
      return;
    }

    try {
      // This is a simplified conversion - in a real app this would be more complex
      // and would properly parse the Pine Script syntax
      const jsonResult = {
        script: pineScript,
        version: "1.0",
        indicators: [],
        conditions: [],
        settings: {},
        inputs: {} // Added dedicated section for input parameters
      };

      // Extract indicators, conditions, and inputs (simplified example)
      const lines = pineScript.split('\n');
      
      // First pass: extract all input parameters
      lines.forEach(line => {
        // Use more permissive pattern matching for input parameters
        const trimmedLine = line.trim();
        
        // Skip empty lines or comments
        if (!trimmedLine || trimmedLine.startsWith('//')) {
          return;
        }
        
        // Check if line contains input definition
        if (trimmedLine.includes('input.') || trimmedLine.includes('input(')) {
          // Extract variable name (before the = sign)
          const varNameMatch = trimmedLine.match(/^([a-zA-Z0-9_]+)\s*=/);
          
          if (varNameMatch) {
            const varName = varNameMatch[1].trim();
            
            // Create the input info object with defaults
            const inputInfo = {
              type: 'unknown',
              title: varName, // Default title is the variable name
              defaultValue: 'undefined',
              options: [],
              minval: null,
              maxval: null,
              tooltip: null,
              group: null,
              fullLine: trimmedLine // Store the full line for debugging
            };
            
            // Determine input type
            if (trimmedLine.includes('input.int')) {
              inputInfo.type = 'integer';
            } else if (trimmedLine.includes('input.float')) {
              inputInfo.type = 'float';
            } else if (trimmedLine.includes('input.bool')) {
              inputInfo.type = 'boolean';
            } else if (trimmedLine.includes('input.string')) {
              inputInfo.type = 'string';
            } else if (trimmedLine.includes('input.color')) {
              inputInfo.type = 'color';
            } else if (trimmedLine.includes('input(')) {
              inputInfo.type = 'simple';
            }
            
            // Extract default value - try multiple patterns
            let defaultValue = null;
            
            // Pattern 1: defval = value
            const defvalMatch = trimmedLine.match(/defval\s*=\s*([^,\)]+)/);
            if (defvalMatch) {
              defaultValue = defvalMatch[1].trim();
            } 
            // Pattern 2: input(value, ...
            else {
              const simpleDefaultMatch = trimmedLine.match(/input\(([^,\)]+)/);
              if (simpleDefaultMatch) {
                defaultValue = simpleDefaultMatch[1].trim();
              }
            }
            
            if (defaultValue) {
              inputInfo.defaultValue = defaultValue;
            }
            
            // Extract title - be more permissive with the pattern
            const titleMatch = trimmedLine.match(/title\s*=\s*(['"])([^'"]*)\1/);
            if (titleMatch && titleMatch[2]) {
              inputInfo.title = titleMatch[2];
            }
            
            // Extract min value - try multiple patterns
            const minvalMatch = trimmedLine.match(/minval\s*=\s*([^,\)]+)/);
            if (minvalMatch) {
              inputInfo.minval = minvalMatch[1].trim();
            }
            
            // Extract max value
            const maxvalMatch = trimmedLine.match(/maxval\s*=\s*([^,\)]+)/);
            if (maxvalMatch) {
              inputInfo.maxval = maxvalMatch[1].trim();
            }
            
            // Extract tooltip - handles both variable references and string literals
            const tooltipDirectMatch = trimmedLine.match(/tooltip\s*=\s*(['"])([^'"]*)\1/);
            if (tooltipDirectMatch) {
              inputInfo.tooltip = tooltipDirectMatch[2];
            } else {
              const tooltipVarMatch = trimmedLine.match(/tooltip\s*=\s*([a-zA-Z0-9_]+)/);
              if (tooltipVarMatch) {
                inputInfo.tooltip = tooltipVarMatch[1]; // Variable reference
              }
            }
            
            // Extract group - handles both string literals and variable references
            const groupDirectMatch = trimmedLine.match(/group\s*=\s*(['"])([^'"]*)\1/);
            if (groupDirectMatch) {
              inputInfo.group = groupDirectMatch[2];
            } else {
              const groupVarMatch = trimmedLine.match(/group\s*=\s*([a-zA-Z0-9_]+)/);
              if (groupVarMatch) {
                inputInfo.group = groupVarMatch[1]; // Variable reference
              }
            }
            
            // Extract options for string inputs
            const optionsMatch = trimmedLine.match(/options\s*=\s*\[([^\]]+)\]/);
            if (optionsMatch) {
              const optionsStr = optionsMatch[1];
              // Split by commas but be careful about nested structures
              const options = optionsStr.split(',').map(opt => opt.trim());
              inputInfo.options = options;
            }
            
            // Store the input in our JSON result
            jsonResult.inputs[varName] = inputInfo;
          }
        }
      });
      
      // Second pass: Extract indicators, conditions, and other settings
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (!trimmedLine || trimmedLine.startsWith('//')) {
          return;
        }
        
        if (trimmedLine.includes('indicator(')) {
          jsonResult.indicators.push(trimmedLine);
        } else if (trimmedLine.includes('if ') && trimmedLine.includes('then')) {
          jsonResult.conditions.push(trimmedLine);
        } else if (trimmedLine.includes('=') && !trimmedLine.includes('input')) {
          // Only process as a setting if it's not already processed as an input
          const parts = trimmedLine.split('=');
          if (parts.length === 2) {
            const key = parts[0].trim();
            if (!jsonResult.inputs[key]) { // Avoid duplicating inputs as settings
              const value = parts[1].trim();
              jsonResult.settings[key] = value;
            }
          }
        }
      });

      // For debugging - log the inputs to console
      console.log("Detected inputs:", Object.keys(jsonResult.inputs).length, jsonResult.inputs);
      
      setJsonData(jsonResult);
    } catch (error) {
      console.error('Error converting to JSON:', error);
      alert('Error converting Pine Script to JSON: ' + error.message);
    }
  };

  const handleOptimize = () => {
    if (!jsonData) {
      alert('Please convert the Pine Script first');
      return;
    }
    
    if (!symbol) {
      alert('Please enter a trading symbol');
      return;
    }
    
    if (!startDate || !endDate) {
      alert('Please select a date range');
      return;
    }

    setIsLoading(true);

    // Simulate API call for optimization
    setTimeout(() => {
      // In a real app, this would be the result from a backend service
      const mockResults = [
        {
          id: 1,
          params: { stopLoss: 2.5, takeProfit: 5.0, entryDelay: 1 },
          overallReturns: '24.5%',
          maxDrawdown: '8.2%',
          profitFactor: 2.12,
          aiOpinion: 'Strong potential with moderate risk'
        },
        {
          id: 2,
          params: { stopLoss: 3.0, takeProfit: 6.0, entryDelay: 2 },
          overallReturns: '28.3%',
          maxDrawdown: '12.5%',
          profitFactor: 1.85,
          aiOpinion: 'High returns but higher volatility'
        },
        {
          id: 3,
          params: { stopLoss: 2.0, takeProfit: 4.0, entryDelay: 1 },
          overallReturns: '18.7%',
          maxDrawdown: '6.8%',
          profitFactor: 2.35,
          aiOpinion: 'More conservative approach with steady returns'
        }
      ];

      setResults(mockResults);
      setIsLoading(false);
    }, 2000);
  };

  const timeframeOptions = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
  ];

  // Add a test function to help debug with sample Pine Script code
  const addSampleCode = () => {
    const samplePineScript = `// Sample Pine Script with multiple input formats
input_lookback  = input.int(defval = 20, title = 'Lookback Range', minval = 1, tooltip = 'How many bars for a pivot event to occur.', group = g_sr)
input_retSince  = input.int(defval = 2, title = 'Bars Since Breakout', minval = 1, tooltip = 'How many bars since breakout in order to detect a retest.', group = g_sr)
input_retValid  = input.int(defval = 2, title = 'Retest Detection Limiter', minval = 1, tooltip = t_rv, group = g_sr)
input_breakout  = input.bool(defval = true, title = 'Breakouts', group = g_c)
input_retest    = input.bool(defval = true, title = 'Retests', group = g_c)
input_repType   = input.string(defval = 'On', title = 'Repainting', options = ['On', 'Off: Candle Confirmation', 'Off: High & Low'], tooltip = t_r, group = g_c)
input_outL      = input.string(defval = line.style_dotted, title = 'Outline', group = g_st, options = [line.style_dotted, line.style_dashed, line.style_solid])
input_extend    = input.string(defval = extend.none, title = 'Extend', group = g_st, options = [extend.none, extend.right, extend.left, extend.both])
input_labelType = input.string(defval = 'Full', title = 'Label Type', options = ['Full', 'Simple'], group = g_st)
input_labelSize = input.string(defval = size.small, title = 'Label Size', options = [size.tiny, size.small, size.normal, size.large, size.huge], group = g_st)
input_plColor   = input.color(defval = color.red, title = 'Support', inline = 'Color', group = g_st)
input_phColor   = input.color(defval = #089981, title = 'Resistance', inline = 'Color', group = g_st)
input_override  = input.bool(defval = false, title = 'Override Text Color ', inline = 'Override', group = g_st)
input_textColor = input.color(defval = color.white, title = '', inline = 'Override', group = g_st)
bb              = input_lookback`;

    setPineScript(samplePineScript);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Strategy Optimization</h1>
        
        {/* Pine Script Converter and JSON Output in a two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Left column - Pine Script Converter */}
          <div className="w-full lg:w-1/2 bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Pine Script Converter</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Pine Script Code</label>
              <textarea
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm h-80"
                placeholder="Paste your Pine Script code here..."
                value={pineScript}
                onChange={(e) => setPineScript(e.target.value)}
              ></textarea>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                onClick={handleConvert}
              >
                Convert to JSON
              </button>
              <button
                className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                onClick={addSampleCode}
              >
                Load Sample Code
              </button>
            </div>
          </div>
          
          {/* Right column - JSON Output with Parameter Section */}
          <div className="w-full lg:w-1/2 bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">JSON Output</h2>
            {jsonData ? (
              <div className="space-y-4">
                {/* Input Parameters Section */}
                <div className="bg-zinc-800 rounded-lg p-4 max-h-[500px] overflow-auto">
                  <h3 className="text-md font-medium mb-3 text-indigo-400">
                    Input Parameters ({Object.keys(jsonData.inputs).length})
                  </h3>
                  {Object.keys(jsonData.inputs).length > 0 ? (
                    <div className="divide-y divide-zinc-700">
                      {Object.entries(jsonData.inputs).map(([key, value]) => (
                        <div key={key} className="py-3">
                          <div className="flex justify-between items-center flex-wrap">
                            <span className="text-white font-medium">{value.title || key}</span>
                            <div className="flex space-x-2 items-center mt-1 sm:mt-0">
                              {value.group && (
                                <span className="text-xs bg-indigo-900 px-2 py-1 rounded text-indigo-200">
                                  {value.group}
                                </span>
                              )}
                              <span className="text-xs bg-zinc-700 px-2 py-1 rounded text-zinc-300">
                                {value.type}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap justify-between text-sm mt-2 text-zinc-400">
                            <span className="mr-4">Variable: <code className="text-yellow-300">{key}</code></span>
                            <span>Default: <code className="text-green-400">{value.defaultValue}</code></span>
                          </div>
                          
                          {/* Show additional details if available */}
                          <div className="mt-1 text-xs text-zinc-500">
                            {(value.minval || value.maxval) && (
                              <div className="mt-1">
                                Range: {value.minval !== null ? value.minval : 'unlimited'} 
                                {value.maxval !== null ? ` to ${value.maxval}` : ' and up'}
                              </div>
                            )}
                            
                            {value.options && value.options.length > 0 && (
                              <div className="mt-1">
                                Options: {value.options.join(', ')}
                              </div>
                            )}
                            
                            {value.tooltip && (
                              <div className="mt-1 italic">
                                Tooltip: {value.tooltip}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm">No input parameters detected</p>
                  )}
                </div>
                
                {/* Full JSON Section */}
                <div className="bg-zinc-800 rounded-lg p-4 h-48 overflow-auto">
                  <h3 className="text-md font-medium mb-2 text-indigo-400">Complete JSON</h3>
                  <pre className="text-xs text-green-400">
                    {JSON.stringify(jsonData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-80 bg-zinc-800 rounded-lg">
                <p className="text-zinc-500">Convert your Pine Script to see JSON output here</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-zinc-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Optimization Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Symbol</label>
              <input
                type="text"
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                placeholder="e.g., BTCUSDT"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Timeframe</label>
              <select
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                {timeframeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Quantity to Test</label>
              <input
                type="number"
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            onClick={handleOptimize}
            disabled={isLoading}
          >
            {isLoading ? 'Optimizing...' : 'Optimize'}
          </button>
        </div>
        
        {results && (
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Optimization Results</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-zinc-800">
                    <th className="p-3 text-left border-b border-zinc-700">Parameters</th>
                    <th className="p-3 text-left border-b border-zinc-700">Overall Returns</th>
                    <th className="p-3 text-left border-b border-zinc-700">Max Drawdown</th>
                    <th className="p-3 text-left border-b border-zinc-700">Profit Factor</th>
                    <th className="p-3 text-left border-b border-zinc-700">AI Opinion</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => (
                    <tr key={result.id} className="hover:bg-zinc-800 transition-colors">
                      <td className="p-3 border-b border-zinc-700">
                        <div className="text-xs">
                          {Object.entries(result.params).map(([key, value]) => (
                            <div key={key}>{key}: {value}</div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 border-b border-zinc-700 text-green-400">{result.overallReturns}</td>
                      <td className="p-3 border-b border-zinc-700 text-red-400">{result.maxDrawdown}</td>
                      <td className="p-3 border-b border-zinc-700">{result.profitFactor}</td>
                      <td className="p-3 border-b border-zinc-700">{result.aiOpinion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 