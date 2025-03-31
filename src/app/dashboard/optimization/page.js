'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, Clock, ChevronDown, Code, TrendingUp, BarChart2, Zap, Server, RefreshCw, Download, ArrowRight, Info, AlertTriangle } from 'lucide-react';
import { getOptimizationFromCache, loadSavedConfig } from '../../../utils/localStorage';

export default function OptimizationPage() {
  const [activeTab, setActiveTab] = useState('input');
  const [pineScript, setPineScript] = useState('');
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('1D');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [initialCapital, setInitialCapital] = useState(1000000);
  const [quantity, setQuantity] = useState(1);
  const [jsonData, setJsonData] = useState(null);
  const [jsonOutput, setJsonOutput] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [countdownTime, setCountdownTime] = useState(60); // 60 seconds countdown
  const [useCachedResults, setUseCachedResults] = useState(true); // Toggle for using cached results

  // Load saved configuration from localStorage on initial mount
  useEffect(() => {
    const savedConfig = loadSavedConfig();
    if (savedConfig) {
      setSymbol(savedConfig.symbol || '');
      setTimeframe(savedConfig.timeframe || '1D');
      setStartDate(savedConfig.startDate || '');
      setEndDate(savedConfig.endDate || '');
      setInitialCapital(savedConfig.initialCapital || 1000000);
      setQuantity(savedConfig.quantity || 1);
    }
  }, []);

  // Countdown effect
  useEffect(() => {
    let timer;
    if (isLoading && countdownTime > 0) {
      timer = setInterval(() => {
        setCountdownTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Generate and show results when countdown reaches zero
            const randomResults = generateRandomResults();
            setResults(randomResults);
            setIsLoading(false);
            setShowResults(true);
            
            // Save results to localStorage for future use
            if (pineScript) {
              const config = {
                symbol,
                timeframe,
                startDate,
                endDate,
                initialCapital,
                quantity
              };
              saveOptimizationToCache(randomResults, pineScript, config);
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading, countdownTime, pineScript, symbol, timeframe, startDate, endDate, initialCapital, quantity]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleConvert = () => {
    if (!pineScript.trim()) {
      alert('Please enter Pine Script code');
      return;
    }

    setIsConverting(true);
    
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
      setJsonOutput(JSON.stringify(jsonResult, null, 2));
      setIsConverting(false);
      
      // Auto-advance to configure tab if we have inputs
      if (Object.keys(jsonResult.inputs).length > 0) {
        setTimeout(() => {
          handleTabChange('configure');
        }, 1000);
      }
    } catch (error) {
      console.error('Error converting to JSON:', error);
      alert('Error converting Pine Script to JSON: ' + error.message);
      setIsConverting(false);
    }
  };

  const handleOptimize = () => {
    if (!jsonData) {
      alert('Please convert the Pine Script first');
      return;
    }
    
    if (!symbol) {
      alert('Please enter a symbol');
      return;
    }
    
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    // Start optimization process
    setIsLoading(true);
    setCountdownTime(60);
    
    // In a real app, this would call an API to start the optimization
    // For this demo, we'll simulate the process with a countdown
  };

  const generateRandomResults = () => {
    // Generate random optimization results
    // In a real app, this would come from the backend
    
    // Generate a random number of parameters to optimize
    const numParams = Math.floor(Math.random() * 3) + 2; // 2-4 parameters
    
    // Create parameter combinations
    const parameterSets = [];
    const paramNames = ['fastLength', 'slowLength', 'stopLoss', 'takeProfit', 'rsiPeriod', 'rsiOverbought'];
    const selectedParams = paramNames.slice(0, numParams);
    
    // Create parameter grid with random range values
    const paramRanges = {};
    selectedParams.forEach(param => {
      if (param.includes('Length') || param.includes('Period')) {
        paramRanges[param] = { min: 5, max: 50, step: 5 };
      } else if (param.includes('Loss') || param.includes('Profit')) {
        paramRanges[param] = { min: 1.0, max: 5.0, step: 0.5 };
      } else if (param.includes('Overbought')) {
        paramRanges[param] = { min: 65, max: 85, step: 5 };
      } else {
        paramRanges[param] = { min: 1, max: 10, step: 1 };
      }
    });
    
    // Generate random parameter sets with results
    for (let i = 0; i < 20; i++) {
      const paramSet = {};
      
      // Generate random parameter values
      selectedParams.forEach(param => {
        const range = paramRanges[param];
        const steps = Math.floor((range.max - range.min) / range.step);
        const randomStep = Math.floor(Math.random() * (steps + 1));
        paramSet[param] = range.min + (randomStep * range.step);
      });
      
      // Generate random performance metrics
      paramSet.return = +(Math.random() * 50 - 10).toFixed(2);
      paramSet.winRate = +(Math.random() * 40 + 40).toFixed(2);
      paramSet.profitFactor = +(Math.random() * 3 + 0.5).toFixed(2);
      paramSet.maxDrawdown = +(Math.random() * 25 + 5).toFixed(2);
      paramSet.sharpeRatio = +(Math.random() * 2 + 0.1).toFixed(2);
      paramSet.totalTrades = Math.floor(Math.random() * 150 + 30);
      
      parameterSets.push(paramSet);
    }
    
    // Sort by return (descending)
    parameterSets.sort((a, b) => b.return - a.return);
    
    // Generate heat map data
    let heatMapData = [];
    if (selectedParams.length >= 2) {
      const param1 = selectedParams[0];
      const param2 = selectedParams[1];
      const range1 = paramRanges[param1];
      const range2 = paramRanges[param2];
      
      for (let v1 = range1.min; v1 <= range1.max; v1 += range1.step) {
        for (let v2 = range2.min; v2 <= range2.max; v2 += range2.step) {
          heatMapData.push({
            [param1]: v1,
            [param2]: v2,
            return: +(Math.random() * 50 - 10).toFixed(2)
          });
        }
      }
    }
    
    // Generate surface plot data (3D visualization data)
    let surfacePlotData = [];
    if (selectedParams.length >= 3) {
      const param1 = selectedParams[0];
      const param2 = selectedParams[1];
      const param3 = selectedParams[2];
      const range1 = paramRanges[param1];
      const range2 = paramRanges[param2];
      
      for (let v1 = range1.min; v1 <= range1.max; v1 += range1.step) {
        for (let v2 = range2.min; v2 <= range2.max; v2 += range2.step) {
          surfacePlotData.push({
            [param1]: v1,
            [param2]: v2,
            [param3]: +(Math.random() * 20 + 5).toFixed(2),
            return: +(Math.random() * 50 - 5).toFixed(2)
          });
        }
      }
    }
    
    // Find optimal parameter set (best return)
    const optimalParameters = {...parameterSets[0]};
    delete optimalParameters.return;
    delete optimalParameters.winRate;
    delete optimalParameters.profitFactor;
    delete optimalParameters.maxDrawdown;
    delete optimalParameters.sharpeRatio;
    delete optimalParameters.totalTrades;
    
    return {
      parameterSets,
      optimizedParameters: optimalParameters,
      bestResult: {
        return: parameterSets[0].return,
        winRate: parameterSets[0].winRate,
        profitFactor: parameterSets[0].profitFactor,
        maxDrawdown: parameterSets[0].maxDrawdown,
        sharpeRatio: parameterSets[0].sharpeRatio,
        totalTrades: parameterSets[0].totalTrades
      },
      parameterRanges: paramRanges,
      heatMapData,
      surfacePlotData,
      optimizationTime: Math.floor(Math.random() * 60) + 30, // 30-90 seconds
      testedCombinations: heatMapData.length || Math.floor(Math.random() * 300) + 100
    };
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
  
  const clearCode = () => {
    setPineScript('');
    setJsonOutput('');
    setJsonData(null);
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
            {activeTab === 'input' && (
              <button 
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center text-sm transition-all duration-200 border border-zinc-700"
                onClick={addSampleCode}
              >
                <Code className="w-4 h-4 mr-2" />
                Load Sample
              </button>
            )}
            
            {activeTab === 'configure' && symbol && startDate && endDate && (
              <button 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center text-sm transition-all duration-200 shadow-lg shadow-indigo-900/30"
                onClick={handleOptimize}
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                Run Optimization
              </button>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex mb-6 bg-zinc-900/50 p-1 rounded-lg">
          <button
            className={`px-5 py-3 font-medium rounded-md transition-all ${
              activeTab === 'input' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
            onClick={() => handleTabChange('input')}
          >
            <div className="flex items-center">
              <Code className="w-4 h-4 mr-2" />
              1. Strategy Input
            </div>
          </button>
          <button
            className={`px-5 py-3 font-medium rounded-md transition-all ${
              activeTab === 'configure' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
            onClick={() => handleTabChange('configure')}
          >
            <div className="flex items-center">
              <Server className="w-4 h-4 mr-2" />
              2. Configure Test
            </div>
          </button>
          <button
            className={`px-5 py-3 font-medium rounded-md transition-all ${
              activeTab === 'results' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
            onClick={() => handleTabChange('results')}
          >
            <div className="flex items-center">
              <BarChart2 className="w-4 h-4 mr-2" />
              3. Results
            </div>
          </button>
        </div>
        
        {/* Strategy Input Tab Content */}
        {activeTab === 'input' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50">
                <div className="p-4 bg-zinc-900/70 border-b border-zinc-700/50 flex items-center justify-between">
                  <div className="flex items-center">
                    <Code className="w-5 h-5 text-indigo-500 mr-2" />
                    <h2 className="text-white font-medium">Pine Script Input</h2>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex space-x-2">
                      <span className="text-xs text-zinc-500">{pineScript.split('\n').length} lines</span>
                      <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-400">Pine Script v5</span>
                    </div>
                    <button 
                      className="p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-xs text-zinc-300 transition-colors"
                      onClick={clearCode}
                      title="Clear code"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4 relative">
                  <textarea
                    value={pineScript}
                    onChange={(e) => setPineScript(e.target.value)}
                    className="w-full h-[450px] bg-zinc-900/70 text-zinc-300 font-mono text-sm p-4 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
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
                        onClick={handleConvert}
                        disabled={isConverting}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-900/30 flex items-center"
                      >
                        {isConverting ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
                            Converting...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-3 h-3 mr-1" />
                            Convert
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-3 border-t border-zinc-700/50 flex justify-between items-center bg-zinc-900/30">
                  <div className="text-zinc-400 text-xs">
                    <span className="inline-flex items-center">
                      <Info className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                      Need help with Pine Script? <a href="#" className="text-indigo-400 ml-1 hover:underline">View Documentation</a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-zinc-800/70 rounded-xl shadow-xl h-full overflow-hidden border border-zinc-700/50">
                <div className="p-4 bg-zinc-900/70 border-b border-zinc-700/50 flex items-center">
                  <BarChart2 className="w-5 h-5 text-indigo-500 mr-2" />
                  <h2 className="text-white font-medium">JSON Output</h2>
                </div>
                
                {jsonData ? (
                  <div className="p-4 h-[450px] overflow-auto space-y-4">
                    {/* Input Parameters Section */}
                    <div className="bg-zinc-900/60 rounded-lg p-3 mb-3 border border-zinc-800">
                      <h3 className="text-md font-medium mb-2 text-indigo-400 flex items-center">
                        <Zap className="w-4 h-4 mr-1 text-indigo-400" />
                        Input Parameters ({Object.keys(jsonData.inputs).length})
                      </h3>
                      {Object.keys(jsonData.inputs).length > 0 ? (
                        <div className="divide-y divide-zinc-700/50">
                          {Object.entries(jsonData.inputs).map(([key, value]) => (
                            <div key={key} className="py-2">
                              <div className="flex justify-between items-center flex-wrap">
                                <span className="text-white text-sm">{value.title || key}</span>
                                <span className="text-xs bg-zinc-700/70 px-1.5 py-0.5 rounded-full text-zinc-300">
                                  {value.type}
                                </span>
                              </div>
                              <div className="text-xs text-zinc-400 mt-1">
                                Default: <code className="text-green-400 bg-green-900/20 px-1 rounded">{value.defaultValue}</code>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-zinc-500 text-sm">No input parameters detected</p>
                      )}
                    </div>
                    
                    {/* Optimization Options */}
                    <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800">
                      <h3 className="text-md font-medium mb-2 text-indigo-400 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 text-indigo-400" />
                        Optimization Targets
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <input type="checkbox" id="optimize-return" className="mr-2" defaultChecked />
                          <label htmlFor="optimize-return" className="text-zinc-300">Return (%)</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="optimize-sharpe" className="mr-2" />
                          <label htmlFor="optimize-sharpe" className="text-zinc-300">Sharpe Ratio</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="optimize-drawdown" className="mr-2" />
                          <label htmlFor="optimize-drawdown" className="text-zinc-300">Max Drawdown (%)</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="optimize-profit-factor" className="mr-2" />
                          <label htmlFor="optimize-profit-factor" className="text-zinc-300">Profit Factor</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800">
                      <h3 className="text-md font-medium mb-2 text-zinc-400 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" /> 
                        Notice
                      </h3>
                      <p className="text-zinc-400 text-sm">
                        The optimization process will generate multiple variations of your strategy using different parameter combinations.
                      </p>
                      <p className="text-zinc-400 text-xs mt-2">
                        Click "Configure Test" to proceed with setting up your optimization parameters.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center h-[450px] text-center">
                    <Server className="w-10 h-10 text-zinc-700 mb-3" />
                    <p className="text-zinc-500 mb-1">No data available</p>
                    <p className="text-zinc-600 text-sm">
                      Convert your Pine Script to view parameter information
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Configure Test Tab Content */}
        {activeTab === 'configure' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-800/70 p-6 rounded-xl shadow-xl border border-zinc-700/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2 text-indigo-500" />
                Test Configuration
              </h2>
              {/* Symbol selection */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Symbol</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="Enter trading symbol (e.g. AAPL, BTCUSD)"
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Timeframe</label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="1m">1 Minute</option>
                    <option value="5m">5 Minutes</option>
                    <option value="15m">15 Minutes</option>
                    <option value="1h">1 Hour</option>
                    <option value="4h">4 Hours</option>
                    <option value="1D">1 Day</option>
                    <option value="1W">1 Week</option>
                  </select>
                </div>
              </div>
              
              {/* Date range */}
              <h3 className="text-md font-medium mb-3 text-zinc-300">Date Range</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              {/* Account parameters */}
              <h3 className="text-md font-medium mb-3 text-zinc-300">Account Parameters</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Initial Capital</label>
                  <input
                    type="number"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Contract Size</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-800/70 p-6 rounded-xl shadow-xl border border-zinc-700/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-indigo-500" />
                Optimization Settings
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Optimization Algorithm</label>
                  <select
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="brute-force">Brute Force</option>
                    <option value="genetic">Genetic Algorithm</option>
                    <option value="grid">Grid Search</option>
                    <option value="random">Random Search</option>
                  </select>
                  <p className="text-xs text-zinc-500 mt-1">Brute force tests all combinations for maximum accuracy but can take longer.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Optimization Target</label>
                  <select
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="return">Net Return (%)</option>
                    <option value="sharpe">Sharpe Ratio</option>
                    <option value="sortino">Sortino Ratio</option>
                    <option value="profit-factor">Profit Factor</option>
                    <option value="max-drawdown">Minimize Max Drawdown</option>
                  </select>
                </div>
                
                <div className="bg-amber-900/20 border border-amber-900/40 rounded-lg p-3 flex text-amber-400">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <div className="text-sm">
                    <p>Optimization may take a long time depending on the number of parameters and combinations.</p>
                    <p className="mt-1 text-xs">Be careful of overfitting - optimal parameters on historical data may not perform well on future data.</p>
                  </div>
                </div>
                
                <button 
                  className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center text-sm transition-all duration-200 shadow-lg shadow-indigo-900/30"
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
              </div>
            </div>
          </div>
        )}
        
        {/* Results Tab Content */}
        {activeTab === 'results' && (
          <div>
            {isLoading ? (
              <div className="bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50 p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-200 border-opacity-20 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent animate-spin rounded-full absolute top-0 left-0"></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">Optimization In Progress</h3>
                    <p className="text-zinc-400 mb-6">Testing parameter combinations to find the optimal strategy</p>
                    <div className="bg-zinc-700/50 h-2 rounded-full max-w-md mx-auto overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full" 
                        style={{ width: `${Math.max(5, 100 - (countdownTime / 60 * 100))}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-zinc-500">
                      <span className="font-mono">{countdownTime}</span> seconds remaining (approximately)
                    </div>
                  </div>
                </div>
              </div>
            ) : results ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Best Parameters Card */}
                  <div className="bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50">
                    <div className="p-4 bg-indigo-900/30 border-b border-indigo-800/30 flex items-center">
                      <Zap className="w-5 h-5 text-indigo-400 mr-2" />
                      <h2 className="text-white font-medium">Optimized Parameters</h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4">
                        {results && results.optimizedParameters && Object.entries(results.optimizedParameters).map(([param, value]) => (
                          <div key={param} className="bg-zinc-900/50 p-3 rounded-lg">
                            <div className="text-zinc-400 text-xs mb-1">{param}</div>
                            <div className="text-white font-semibold text-lg">{value}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-zinc-700/30 grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-zinc-400 text-xs mb-1">Return</div>
                          <div className="text-white font-semibold text-lg">{results?.bestResult?.return}%</div>
                        </div>
                        <div>
                          <div className="text-zinc-400 text-xs mb-1">Win Rate</div>
                          <div className="text-white font-semibold text-lg">{results?.bestResult?.winRate}%</div>
                        </div>
                        <div>
                          <div className="text-zinc-400 text-xs mb-1">Profit Factor</div>
                          <div className="text-white font-semibold text-lg">{results?.bestResult?.profitFactor}</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-xs text-zinc-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Optimization completed in {results?.optimizationTime} seconds
                      </div>
                    </div>
                  </div>
                  
                  {/* Optimization Performance Charts */}
                  <div className="lg:col-span-2 bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50">
                    <div className="p-4 bg-zinc-900/70 border-b border-zinc-700/50 flex items-center justify-between">
                      <div className="flex items-center">
                        <BarChart2 className="w-5 h-5 text-indigo-500 mr-2" />
                        <h2 className="text-white font-medium">Performance Analysis</h2>
                      </div>
                      <div className="text-xs text-zinc-400">
                        {results?.testedCombinations} combinations tested
                      </div>
                    </div>
                    <div className="p-6">
                      {/* Placeholder for chart - in a real app, you'd use a charting library */}
                      <div className="bg-zinc-900/70 rounded-lg h-64 flex items-center justify-center">
                        <div className="text-zinc-500 text-center">
                          <BarChart2 className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
                          <p className="text-zinc-400">Parameter Optimization Chart</p>
                          <p className="text-zinc-600 text-xs mt-1">Performance visualization would appear here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Parameter Results Table */}
                <div className="bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50">
                  <div className="p-4 bg-zinc-900/70 border-b border-zinc-700/50 flex items-center justify-between">
                    <div className="flex items-center">
                      <Server className="w-5 h-5 text-indigo-500 mr-2" />
                      <h2 className="text-white font-medium">Top Parameter Combinations</h2>
                    </div>
                    <button className="text-sm text-zinc-400 hover:text-white flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      Export CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-zinc-900/30">
                      <thead>
                        <tr className="bg-zinc-800/80">
                          <th className="py-3 px-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Rank</th>
                          {results && results.optimizedParameters && Object.keys(results.optimizedParameters).map(param => (
                            <th key={param} className="py-3 px-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">{param}</th>
                          ))}
                          <th className="py-3 px-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Return %</th>
                          <th className="py-3 px-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Win Rate</th>
                          <th className="py-3 px-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Profit Factor</th>
                          <th className="py-3 px-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Max DD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {results && results.parameterSets && results.parameterSets.slice(0, 10).map((set, idx) => (
                          <tr key={idx} className={idx === 0 ? "bg-indigo-900/20" : "hover:bg-zinc-800/40"}>
                            <td className="py-3 px-4 whitespace-nowrap text-sm text-white">{idx + 1}</td>
                            {Object.keys(results.optimizedParameters).map(param => (
                              <td key={param} className="py-3 px-4 whitespace-nowrap text-sm text-white">{set[param]}</td>
                            ))}
                            <td className="py-3 px-4 whitespace-nowrap text-sm text-right font-medium text-green-400">{set.return}%</td>
                            <td className="py-3 px-4 whitespace-nowrap text-sm text-right">{set.winRate}%</td>
                            <td className="py-3 px-4 whitespace-nowrap text-sm text-right">{set.profitFactor}</td>
                            <td className="py-3 px-4 whitespace-nowrap text-sm text-right text-red-400">{set.maxDrawdown}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50 p-8">
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <BarChart2 className="w-16 h-16 text-zinc-700" />
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">No Results Available</h3>
                    <p className="text-zinc-400 max-w-md mx-auto">
                      Complete the strategy input and configuration steps, then run the optimization to see results.
                    </p>
                    <button 
                      onClick={() => handleTabChange('input')}
                      className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center text-sm transition-all duration-200 shadow-lg shadow-indigo-900/30 mx-auto"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Start with Strategy Input
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
} 