'use client';

import { useState } from 'react';
import { CalendarIcon, Clock, BarChart2, TrendingUp, TrendingDown, Zap, ChevronDown, AlertTriangle, Info, Download, Code, Server } from 'lucide-react';

export default function Backtest() {
  const [activeTab, setActiveTab] = useState('input');
  const [pineScript, setPineScript] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonData, setJsonData] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isBacktesting, setIsBacktesting] = useState(false);
  
  // Form state
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('1D');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [initialCapital, setInitialCapital] = useState(10000);
  const [positionSize, setPositionSize] = useState(20);
  
  // Sample results data
  const backtestResults = {
    overallReturn: 32.5,
    winRate: 65.2,
    profitFactor: 2.3,
    maxDrawdown: 14.7,
    sharpeRatio: 1.85,
    totalTrades: 87,
    winningTrades: 57,
    losingTrades: 30,
    averageWin: 4.82,
    averageLoss: 2.76,
    largestWin: 12.3,
    largestLoss: 8.1,
    recommendations: [
      "Consider increasing position size as the strategy shows strong risk-adjusted returns",
      "Strategy performs better in trending markets; consider adding a trend filter",
      "Losses are concentrated in sideways markets; implement a range detection mechanism",
      "Long trades outperform short trades; consider optimizing short entry criteria"
    ]
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const convertToJson = () => {
    if (!pineScript.trim()) return;
    
    setIsConverting(true);
    
    try {
      // Initialize the JSON structure
      const jsonResult = {
        script: pineScript,
        version: "1.0",
        indicators: [],
        conditions: [],
        settings: {},
        inputs: {} // Dedicated section for input parameters
      };

      // Extract indicators, conditions, and inputs
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
        } else if (trimmedLine.includes('strategy(')) {
          jsonResult.strategy = trimmedLine;
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

      // Convert jsonResult to string for display
      setJsonOutput(JSON.stringify(jsonResult, null, 2));
      setJsonData(jsonResult);
      setIsConverting(false);
      setActiveTab('configure'); // Move to next tab after conversion
      
    } catch (error) {
      console.error('Error converting to JSON:', error);
      alert('Error converting Pine Script to JSON: ' + error.message);
      setIsConverting(false);
    }
  };
  
  const runBacktest = () => {
    if (!symbol || !startDate || !endDate) return;
    
    setIsBacktesting(true);
    
    // Simulate backtesting delay
    setTimeout(() => {
      setIsBacktesting(false);
      setShowResults(true);
      setActiveTab('results'); // Move to results tab
    }, 2500);
  };
  
  // Add a test function to help debug with sample Pine Script code
  const addSampleCode = () => {
    const samplePineScript = `// Sample Pine Script with multiple input formats
strategy("SMA Crossover Strategy", overlay=true)
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
bb              = input_lookback

// Strategy logic
fastMA = sma(close, input_lookback)
slowMA = sma(close, input_retSince * 10)

longCondition = crossover(fastMA, slowMA)
shortCondition = crossunder(fastMA, slowMA)

if (longCondition and input_breakout)
    strategy.entry("Long", strategy.long)

if (shortCondition and input_retest)
    strategy.entry("Short", strategy.short)`;

    setPineScript(samplePineScript);
  };
  
  const clearCode = () => {
    setPineScript('');
    setJsonOutput('');
    setJsonData(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold mb-2">Strategy Backtesting</h1>
        <p className="text-zinc-400">Test your trading strategies with historical data and analyze performance</p>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-zinc-800 mb-6">
        <button
          className={`px-4 py-3 font-medium ${activeTab === 'input' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-zinc-400 hover:text-zinc-200'}`}
          onClick={() => handleTabChange('input')}
        >
          1. Strategy Input
        </button>
        <button
          className={`px-4 py-3 font-medium ${activeTab === 'configure' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-zinc-400 hover:text-zinc-200'}`}
          onClick={() => handleTabChange('configure')}
        >
          2. Configure Test
        </button>
        <button
          className={`px-4 py-3 font-medium ${activeTab === 'results' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-zinc-400 hover:text-zinc-200'}`}
          onClick={() => handleTabChange('results')}
        >
          3. Results
        </button>
      </div>
      
      {/* Strategy Input Tab */}
      {activeTab === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-zinc-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-4 bg-zinc-900 border-b border-zinc-700 flex items-center justify-between">
                <div className="flex items-center">
                  <Code className="w-5 h-5 text-purple-400 mr-2" />
                  <h2 className="text-white font-medium">Pine Script Input</h2>
                </div>
                <div className="space-x-2">
                  <button 
                    className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-xs text-zinc-300 transition-colors"
                    onClick={addSampleCode}
                  >
                    Load Example
                  </button>
                  <button 
                    className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-xs text-zinc-300 transition-colors"
                    onClick={clearCode}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  value={pineScript}
                  onChange={(e) => setPineScript(e.target.value)}
                  className="w-full h-96 bg-zinc-900 text-zinc-300 font-mono text-sm p-4 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="// Paste your Pine Script strategy code here
// Example:
strategy(&quot;SMA Crossover Strategy&quot;, overlay=true)
fastLength = input(10, title=&quot;Fast Length&quot;)
slowLength = input(30, title=&quot;Slow Length&quot;)
fastMA = sma(close, fastLength)
slowMA = sma(close, slowLength)

longCondition = crossover(fastMA, slowMA)
shortCondition = crossunder(fastMA, slowMA)

if (longCondition)
    strategy.entry(&quot;Long&quot;, strategy.long)

if (shortCondition)
    strategy.entry(&quot;Short&quot;, strategy.short)"
                ></textarea>
              </div>
              <div className="p-4 border-t border-zinc-700 flex justify-between items-center">
                <div className="text-zinc-400 text-sm">
                  <span className="inline-flex items-center">
                    <Info className="w-4 h-4 mr-1" />
                    Need help with Pine Script? <a href="#" className="text-purple-400 ml-1">View Documentation</a>
                  </span>
                </div>
                <button 
                  onClick={convertToJson}
                  disabled={!pineScript.trim() || isConverting}
                  className={`px-4 py-2 rounded-lg text-white font-medium flex items-center ${
                    !pineScript.trim() || isConverting ? 'bg-purple-700/50 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {isConverting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Converting...
                    </>
                  ) : (
                    <>Convert to JSON</>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-zinc-800 rounded-xl shadow-xl h-full overflow-hidden">
              <div className="p-4 bg-zinc-900 border-b border-zinc-700">
                <h2 className="text-white font-medium">JSON Output</h2>
              </div>
              <div className="p-4 h-[calc(100%-57px)] overflow-auto">
                {jsonData ? (
                  <div className="space-y-4">
                    {/* Input Parameters Section */}
                    <div className="bg-zinc-900 rounded-lg p-3 mb-3">
                      <h3 className="text-md font-medium mb-2 text-purple-400">
                        Input Parameters ({Object.keys(jsonData.inputs).length})
                      </h3>
                      {Object.keys(jsonData.inputs).length > 0 ? (
                        <div className="divide-y divide-zinc-700">
                          {Object.entries(jsonData.inputs).map(([key, value]) => (
                            <div key={key} className="py-2">
                              <div className="flex justify-between items-center flex-wrap">
                                <span className="text-white font-medium">{value.title || key}</span>
                                <div className="flex space-x-2 items-center mt-1 sm:mt-0">
                                  {value.group && (
                                    <span className="text-xs bg-purple-900/60 px-2 py-1 rounded text-purple-200">
                                      {value.group}
                                    </span>
                                  )}
                                  <span className="text-xs bg-zinc-700 px-2 py-1 rounded text-zinc-300">
                                    {value.type}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap justify-between text-sm mt-1 text-zinc-400">
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
                    
                    {/* Complete JSON */}
                    <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap">{jsonOutput}</pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Server className="w-12 h-12 text-zinc-600 mb-3" />
                    <p className="text-zinc-500">JSON parser output will appear here after conversion</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Configure Test Tab */}
      {activeTab === 'configure' && (
        <div className="bg-zinc-800 rounded-xl shadow-xl overflow-hidden">
          <div className="p-4 bg-zinc-900 border-b border-zinc-700">
            <h2 className="text-white font-medium">Backtest Configuration</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="symbol" className="block text-white mb-2">Trading Symbol</label>
                <div className="relative">
                  <select
                    id="symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="appearance-none w-full px-4 py-3 pr-10 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select a symbol</option>
                    <option value="AAPL">AAPL (Apple Inc.)</option>
                    <option value="MSFT">MSFT (Microsoft Corp.)</option>
                    <option value="GOOGL">GOOGL (Alphabet Inc.)</option>
                    <option value="AMZN">AMZN (Amazon.com Inc.)</option>
                    <option value="TSLA">TSLA (Tesla Inc.)</option>
                    <option value="BTCUSD">BTCUSD (Bitcoin)</option>
                    <option value="ETHUSD">ETHUSD (Ethereum)</option>
                    <option value="EURUSD">EURUSD (Euro/USD)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-zinc-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label htmlFor="timeframe" className="block text-white mb-2">Timeframe</label>
                <div className="relative">
                  <select
                    id="timeframe"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="appearance-none w-full px-4 py-3 pr-10 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="1m">1 Minute</option>
                    <option value="5m">5 Minutes</option>
                    <option value="15m">15 Minutes</option>
                    <option value="1h">1 Hour</option>
                    <option value="4h">4 Hours</option>
                    <option value="1D">1 Day</option>
                    <option value="1W">1 Week</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-zinc-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label htmlFor="startDate" className="block text-white mb-2">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <CalendarIcon className="absolute right-3 top-3 text-zinc-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-white mb-2">End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <CalendarIcon className="absolute right-3 top-3 text-zinc-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label htmlFor="initialCapital" className="block text-white mb-2">Initial Capital</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-white">$</span>
                  <input
                    type="number"
                    id="initialCapital"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                    min="100"
                    className="w-full px-4 py-3 pl-8 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="positionSize" className="block text-white mb-2">Position Size (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    id="positionSize"
                    value={positionSize}
                    onChange={(e) => setPositionSize(Number(e.target.value))}
                    min="1"
                    max="100"
                    className="w-full px-4 py-3 pr-8 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="absolute right-4 top-3 text-white">%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-900 mt-6 p-4 rounded-lg flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-zinc-300 text-sm">
                  Backtesting simulates historical performance but doesn't guarantee future results. Past performance is not indicative of future returns. Make sure your date range has sufficient data for meaningful results.
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={runBacktest}
                disabled={!symbol || !startDate || !endDate || isBacktesting}
                className={`px-6 py-3 rounded-lg text-white font-medium flex items-center ${
                  !symbol || !startDate || !endDate || isBacktesting ? 'bg-purple-700/50 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isBacktesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Running Backtest...
                  </>
                ) : (
                  <>Run Backtest</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Results Tab */}
      {activeTab === 'results' && (
        <>
          {showResults ? (
            <div className="space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-800 rounded-xl p-4 shadow-lg flex items-center">
                  <div className="w-12 h-12 bg-green-900/30 text-green-500 flex items-center justify-center rounded-lg mr-4">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">Overall Return</p>
                    <div className="flex items-baseline">
                      <span className="text-white text-2xl font-bold">{backtestResults.overallReturn}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-zinc-800 rounded-xl p-4 shadow-lg flex items-center">
                  <div className="w-12 h-12 bg-red-900/30 text-red-500 flex items-center justify-center rounded-lg mr-4">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">Max Drawdown</p>
                    <div className="flex items-baseline">
                      <span className="text-white text-2xl font-bold">{backtestResults.maxDrawdown}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-zinc-800 rounded-xl p-4 shadow-lg flex items-center">
                  <div className="w-12 h-12 bg-blue-900/30 text-blue-500 flex items-center justify-center rounded-lg mr-4">
                    <BarChart2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">Profit Factor</p>
                    <div className="flex items-baseline">
                      <span className="text-white text-2xl font-bold">{backtestResults.profitFactor}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-zinc-800 rounded-xl p-4 shadow-lg flex items-center">
                  <div className="w-12 h-12 bg-purple-900/30 text-purple-500 flex items-center justify-center rounded-lg mr-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">Sharpe Ratio</p>
                    <div className="flex items-baseline">
                      <span className="text-white text-2xl font-bold">{backtestResults.sharpeRatio}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Charts section */}
              <div className="bg-zinc-800 rounded-xl shadow-xl overflow-hidden">
                <div className="p-4 bg-zinc-900 border-b border-zinc-700">
                  <h2 className="text-white font-medium">Equity Curve</h2>
                </div>
                <div className="p-4">
                  <div className="h-80 bg-zinc-900 rounded-lg flex items-center justify-center">
                    <p className="text-zinc-500">Equity curve visualization would be displayed here</p>
                  </div>
                </div>
              </div>
              
              {/* Statistics and breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-zinc-800 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-4 bg-zinc-900 border-b border-zinc-700">
                    <h2 className="text-white font-medium">Trade Statistics</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                      <div>
                        <p className="text-zinc-400 text-sm mb-1">Total Trades</p>
                        <p className="text-white font-medium">{backtestResults.totalTrades}</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm mb-1">Win Rate</p>
                        <p className="text-white font-medium">{backtestResults.winRate}%</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm mb-1">Winning Trades</p>
                        <p className="text-green-500 font-medium">{backtestResults.winningTrades}</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm mb-1">Losing Trades</p>
                        <p className="text-red-500 font-medium">{backtestResults.losingTrades}</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm mb-1">Average Win</p>
                        <p className="text-green-500 font-medium">{backtestResults.averageWin}%</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm mb-1">Average Loss</p>
                        <p className="text-red-500 font-medium">{backtestResults.averageLoss}%</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm mb-1">Largest Win</p>
                        <p className="text-green-500 font-medium">{backtestResults.largestWin}%</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm mb-1">Largest Loss</p>
                        <p className="text-red-500 font-medium">{backtestResults.largestLoss}%</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-zinc-800 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-4 bg-zinc-900 border-b border-zinc-700">
                    <h2 className="text-white font-medium">AI-Driven Recommendations</h2>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      {backtestResults.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-6 h-6 bg-purple-900/30 text-purple-500 flex items-center justify-center rounded-full mr-3 mt-0.5 flex-shrink-0">
                            <Zap className="w-3 h-3" />
                          </div>
                          <p className="text-zinc-300">{recommendation}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Download section */}
              <div className="flex justify-end mt-8 space-x-4">
                <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report (PDF)
                </button>
                <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data (CSV)
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-800 rounded-xl p-10 shadow-xl text-center">
              <Clock className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-white text-xl font-medium mb-2">No Backtest Results Yet</h3>
              <p className="text-zinc-400 mb-6">Configure and run a backtest to see your strategy performance</p>
              <button 
                onClick={() => setActiveTab('configure')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Go to Configuration
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 