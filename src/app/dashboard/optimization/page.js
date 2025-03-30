'use client';

import { useState } from 'react';
import { CalendarIcon, ChevronDown, Code, TrendingUp, BarChart2, Zap, Server, RefreshCw, Download, ArrowRight } from 'lucide-react';

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
    { value: 'tick', label: 'Tick Data' },
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
    <div className="min-h-screen text-white bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-transparent bg-clip-text">Strategy Optimization</h1>
            <p className="text-zinc-400 mt-1">Fine-tune your trading strategies with advanced optimization tools</p>
          </div>
          <div className="flex space-x-3">
            <button 
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center text-sm transition-all duration-200 border border-zinc-700"
              onClick={addSampleCode}
            >
              <Code className="w-4 h-4 mr-2" />
              Load Sample
            </button>
            {jsonData && !results && (
              <button 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center text-sm transition-all duration-200 shadow-lg shadow-indigo-900/30"
                onClick={handleOptimize}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Run Optimization
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Pine Script Converter and JSON Output in a two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left column - Pine Script Converter */}
          <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Server className="w-5 h-5 mr-2 text-indigo-500" />
                Pine Script Converter
              </h2>
              <div className="flex space-x-2">
                {pineScript && (
                  <button
                    className="text-zinc-400 hover:text-zinc-200 p-1 transition-colors"
                    onClick={() => setPineScript('')}
                    title="Clear code"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-zinc-300">Pine Script Code</label>
                <div className="flex space-x-2">
                  <span className="text-xs text-zinc-500">{pineScript.split('\n').length} lines</span>
                  <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-400">Pine Script v5</span>
                </div>
              </div>
              <div className="relative">
                <textarea
                  className="w-full p-4 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white font-mono text-sm h-[400px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="// Paste your Pine Script code here..."
                  value={pineScript}
                  onChange={(e) => setPineScript(e.target.value)}
                  style={{ resize: 'none' }}
                ></textarea>
                <div className="absolute right-3 bottom-3 flex space-x-2">
                  {!pineScript && (
                    <button
                      className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center"
                      onClick={addSampleCode}
                    >
                      <Code className="w-3 h-3 mr-1" />
                      Load Example
                    </button>
                  )}
                  {pineScript && (
                    <button
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-900/30 flex items-center"
                      onClick={handleConvert}
                    >
                      <ArrowRight className="w-3 h-3 mr-1" />
                      Convert
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - JSON Output with Parameter Section */}
          <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-indigo-500" />
                JSON Output
              </h2>
            </div>
            {jsonData ? (
              <div className="space-y-4">
                {/* Input Parameters Section */}
                <div className="bg-zinc-800/50 rounded-xl p-4 max-h-[250px] overflow-auto border border-zinc-700/30">
                  <h3 className="text-md font-medium mb-3 text-indigo-400 flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-indigo-400" />
                    Input Parameters ({Object.keys(jsonData.inputs).length})
                  </h3>
                  {Object.keys(jsonData.inputs).length > 0 ? (
                    <div className="divide-y divide-zinc-700/50">
                      {Object.entries(jsonData.inputs).map(([key, value]) => (
                        <div key={key} className="py-3">
                          <div className="flex justify-between items-center flex-wrap">
                            <span className="text-white font-medium">{value.title || key}</span>
                            <div className="flex space-x-2 items-center mt-1 sm:mt-0">
                              {value.group && (
                                <span className="text-xs bg-indigo-900/70 px-2 py-0.5 rounded-full text-indigo-200">
                                  {value.group}
                                </span>
                              )}
                              <span className="text-xs bg-zinc-700/70 px-2 py-0.5 rounded-full text-zinc-300">
                                {value.type}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap justify-between text-sm mt-2 text-zinc-400">
                            <span className="mr-4">Variable: <code className="text-yellow-300 bg-yellow-900/20 px-1 rounded">{key}</code></span>
                            <span>Default: <code className="text-green-400 bg-green-900/20 px-1 rounded">{value.defaultValue}</code></span>
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
                <div className="bg-zinc-800/50 rounded-xl p-4 h-[134px] overflow-auto border border-zinc-700/30">
                  <h3 className="text-md font-medium mb-2 text-indigo-400 flex items-center">
                    <Code className="w-4 h-4 mr-1 text-indigo-400" />
                    Complete JSON
                  </h3>
                  <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                    {JSON.stringify(jsonData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] bg-zinc-800/30 rounded-xl border border-dashed border-zinc-700/50">
                <BarChart2 className="w-12 h-12 text-zinc-700 mb-4" />
                <p className="text-zinc-500 text-center max-w-xs">
                  Convert your Pine Script to generate a structured JSON representation
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white text-sm rounded-lg transition-colors flex items-center shadow-lg shadow-indigo-900/20"
                  onClick={addSampleCode}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Load Sample Code
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-zinc-900 rounded-xl p-6 mb-8 shadow-xl border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
              Optimization Settings
            </h2>
            {!jsonData && (
              <div className="text-xs px-3 py-1 bg-amber-800/30 text-amber-400 rounded-full flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Convert Pine Script first
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Symbol</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  placeholder="e.g., BTCUSDT"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-xs px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-400">Symbol</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Timeframe</label>
              <div className="relative">
                <select
                  className="w-full p-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                >
                  {timeframeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Quantity to Test</label>
              <input
                type="number"
                className="w-full p-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full p-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-zinc-400" />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full p-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-zinc-400" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-zinc-500">
              {jsonData && <span>Optimizing {Object.keys(jsonData.inputs).length} input parameters</span>}
            </div>
            <button
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center ${
                jsonData 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
              onClick={handleOptimize}
              disabled={!jsonData || isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Run Optimization
                </>
              )}
            </button>
          </div>
        </div>
        
        {results && (
          <div className="bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-indigo-500" />
                Optimization Results
              </h2>
              <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm flex items-center transition-all duration-200">
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export Results
              </button>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-zinc-800 shadow-inner bg-zinc-800/30">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-zinc-800">
                      <th className="p-3 text-left border-b border-zinc-700 font-medium text-zinc-300">Parameters</th>
                      <th className="p-3 text-left border-b border-zinc-700 font-medium text-zinc-300">Overall Returns</th>
                      <th className="p-3 text-left border-b border-zinc-700 font-medium text-zinc-300">Max Drawdown</th>
                      <th className="p-3 text-left border-b border-zinc-700 font-medium text-zinc-300">Profit Factor</th>
                      <th className="p-3 text-left border-b border-zinc-700 font-medium text-zinc-300">AI Opinion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={result.id} className={`hover:bg-zinc-800/70 transition-colors ${index === 0 ? 'bg-indigo-900/10' : ''}`}>
                        <td className="p-3 border-b border-zinc-700/50">
                          <div className="text-xs space-y-1">
                            {Object.entries(result.params).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-zinc-400">{key}:</span>
                                <span className="text-white font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 border-b border-zinc-700/50">
                          <span className="text-green-400 font-semibold">{result.overallReturns}</span>
                        </td>
                        <td className="p-3 border-b border-zinc-700/50">
                          <span className="text-red-400 font-semibold">{result.maxDrawdown}</span>
                        </td>
                        <td className="p-3 border-b border-zinc-700/50">
                          <span className="text-indigo-400 font-semibold">{result.profitFactor}</span>
                        </td>
                        <td className="p-3 border-b border-zinc-700/50">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              result.profitFactor > 2 ? 'bg-green-500' : 
                              result.profitFactor > 1.5 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-zinc-200">{result.aiOpinion}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-zinc-500">Showing {results.length} results</span>
              <div className="flex space-x-2">
                <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm flex items-center transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  Sort by Profit
                </button>
                <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm flex items-center transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Compare Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 