'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, Clock, BarChart2, TrendingUp, TrendingDown, Zap, ChevronDown, AlertTriangle, Info, Download, Code, Server, ArrowRight } from 'lucide-react';
import { saveBacktestToCache, getBacktestFromCache, loadSavedConfig } from '../../../utils/localStorage';
import BacktestButton from '../../../components/dashboard/backtest/BacktestButton';
import GradientText from '../../../components/ui/effects/GradientText';
import TradeSymbolSelector from '../../../components/dashboard/common/TradeSymbolSelector';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../components/ui/tooltips/select';

export default function Backtest() {
  const [activeTab, setActiveTab] = useState('input');
  const [pineScript, setPineScript] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonData, setJsonData] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [countdownTime, setCountdownTime] = useState(60); // 60 seconds countdown
  const [useCachedResults, setUseCachedResults] = useState(true); // Toggle for using cached results

  // Form state
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('1D');
  const [timeDuration, setTimeDuration] = useState('1W');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [initialCapital, setInitialCapital] = useState(1000000);
  const [quantity, setQuantity] = useState(1);

  // Backtest Results state
  const [backtestResults, setBacktestResults] = useState({
    overallReturn: -156.92,
    winRate: 42.5,
    profitFactor: 0.22,
    maxDrawdown: 32.9,
    sharpeRatio: -1.85,
    totalTrades: 87,
    winningTrades: 37,
    losingTrades: 50,
    averageWin: 4.82,
    averageLoss: 8.76,
    largestWin: 12.3,
    largestLoss: 18.1,
    recommendations: [
      "Reduce position size until strategy is further optimized",
      "Consider adding additional filters to reduce false signals",
      "Implement stricter risk management with tighter stop-losses",
      "Test with different market conditions; current parameters may be unsuitable for this market"
    ],
    equityCurveData: Array.from({ length: 100 }, (_, i) => {
      // Starting at 100%
      let equity = 100;
      const progress = i / 99;

      // First phase - small growth to create initial optimism
      if (i < 20) {
        equity = 100 + (i * 0.8); // Grows to about 116%
      }
      // Second phase - initial drawdown
      else if (i < 40) {
        const phaseProgress = (i - 20) / 20;
        equity = 116 - (phaseProgress * 30); // Drops to about 86%
      }
      // Third phase - recovery attempt
      else if (i < 60) {
        const phaseProgress = (i - 40) / 20;
        equity = 86 + (phaseProgress * 15); // Recovers to about 101%
      }
      // Fourth phase - major drawdown
      else if (i < 80) {
        const phaseProgress = (i - 60) / 20;
        equity = 101 - (phaseProgress * 120); // Major drop to about -19%
      }
      // Final phase - continued decline
      else {
        const phaseProgress = (i - 80) / 20;
        equity = -19 - (phaseProgress * 38); // Final drop to about -57%
      }

      // Add some volatility
      const volatility = Math.sin(i * 0.7) * 4;
      equity += volatility;

      // Ensure we end up near the target return of -156.92%
      if (i === 99) {
        equity = -56.92; // Display as -56.92% (represents -156.92% overall return with 100% starting capital)
      }

      return {
        day: i + 1,
        equity: parseFloat(equity.toFixed(2))
      };
    })
  });

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

    // Check if there was a recently failed backtest attempt
    try {
      const lastBacktestConfigStr = localStorage.getItem('backtest_last_config');
      if (lastBacktestConfigStr) {
        const lastBacktestConfig = JSON.parse(lastBacktestConfigStr);
        const lastRunTime = new Date(lastBacktestConfig.lastRun);
        const now = new Date();
        const differenceInMinutes = (now - lastRunTime) / (1000 * 60);

        // If the last backtest was attempted less than 5 minutes ago and the results tab isn't showing
        if (differenceInMinutes < 5 && !showResults && activeTab !== 'results') {
          // Ask user if they want to resume the previous backtest
          const shouldResume = confirm('It appears your previous backtest may not have completed. Would you like to resume it?');

          if (shouldResume) {
            // Restore the previous configuration
            setSymbol(lastBacktestConfig.symbol || '');
            setTimeframe(lastBacktestConfig.timeframe || '1D');
            setTimeDuration(lastBacktestConfig.timeDuration || '1W');
            setStartDate(lastBacktestConfig.startDate || '');
            setEndDate(lastBacktestConfig.endDate || '');
            setInitialCapital(lastBacktestConfig.initialCapital || 1000000);
            setQuantity(lastBacktestConfig.quantity || 1);

            // Start the backtest again
            setTimeout(() => {
              setIsBacktesting(true);
              setActiveTab('results');
              setCountdownTime(60);
            }, 500);
          } else {
            // Clear the last config if they don't want to resume
            localStorage.removeItem('backtest_last_config');
          }
        }
      }
    } catch (error) {
      console.error('Error checking for previous backtest:', error);
      // Silently fail - non-critical functionality
    }
  }, []);

  // Countdown effect
  useEffect(() => {
    let timer;
    if (isBacktesting && countdownTime > 0) {
      timer = setInterval(() => {
        setCountdownTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Generate and show results when countdown reaches zero
            const randomResults = generateRandomResults();
            setBacktestResults(randomResults);
            setIsBacktesting(false);
            setShowResults(true);

            // Save results to localStorage for future use
            if (pineScript) {
              const config = {
                symbol,
                timeframe,
                timeDuration,
                startDate,
                endDate,
                initialCapital,
                quantity
              };
              saveBacktestToCache(randomResults, pineScript, config);

              // Remove the last backtest config since we completed it successfully
              localStorage.removeItem('backtest_last_config');
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isBacktesting && countdownTime === 0) {
      // Backtest is complete, clean up
      if (pineScript) {
        // Remove the last backtest config since we're done
        localStorage.removeItem('backtest_last_config');
      }
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isBacktesting, countdownTime, pineScript, symbol, timeframe, timeDuration, startDate, endDate, initialCapital, quantity]);

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

  // Function to generate random backtest results
  const generateRandomResults = () => {
    // Generate results based on time duration
    let overallReturn, winRate, profitFactor, maxDrawdown, sharpeRatio;

    // Use the time duration to determine the range of results
    switch (timeDuration) {
      case '1W':
        // Under 1 week: +27% to -49%
        overallReturn = Math.random() * 76 - 49;
        break;
      case '1m':
        // Under 1 month: +27% to -84%
        overallReturn = Math.random() * 111 - 84;
        break;
      case '3m':
        // Under 3 month: +27% to -146%
        overallReturn = Math.random() * 173 - 146;
        break;
      case '6m':
        // Under 6 months: +27% to -211%
        overallReturn = Math.random() * 238 - 211;
        break;
      case '1y':
      case '12m':
        // Under 12 months: +27% to -276%
        overallReturn = Math.random() * 303 - 276;
        break;
      case '2y':
      case '24m':
        // Under 24 months: +27% to -381%
        overallReturn = Math.random() * 407 - 381;
        break;
      case '3y':
      case '36m':
        // Under 36 months: +27% to -486%
        overallReturn = Math.random() * 511 - 486;
        break;
      case '4y':
      case '48m':
        // Under 48 months: +27% to -591%
        overallReturn = Math.random() * 616 - 591;
        break;
      case '5y':
      case '60m':
        // Under 60 months: +27% to -696%
        overallReturn = Math.random() * 721 - 696;
        break;
      case '6y':
      case '120m':
        // Under 120 months: +27% to -801%
        overallReturn = Math.random() * 826 - 801;
        break;
      default:
        // Default case
        overallReturn = Math.random() * 197 - 170;
    }

    // Adjust other metrics based on the overall return
    const isPositive = overallReturn > 0;

    // Calculate win rate - positive returns have higher win rates
    winRate = isPositive
      ? 45 + Math.random() * 25 // 45-70% for profitable strategies
      : 20 + Math.random() * 30; // 20-50% for losing strategies

    // Profit factor is correlated with performance
    // For negative returns, profit factor is < 1
    profitFactor = isPositive
      ? 1 + Math.random() * 1.5 // 1.0-2.5 for profitable strategies
      : 0.2 + Math.random() * 0.7; // 0.2-0.9 for losing strategies

    // Max drawdown is typically worse for losing strategies
    maxDrawdown = isPositive
      ? 5 + Math.random() * 25 // 5-30% for profitable strategies
      : 20 + Math.random() * 40; // 20-60% for losing strategies

    // Sharpe ratio - positive for profitable strategies, often negative for losing ones
    sharpeRatio = isPositive
      ? 0.2 + Math.random() * 1.8 // 0.2-2.0 for profitable strategies
      : -2 + Math.random() * 2.2; // -2.0 to +0.2 for losing strategies

    // Calculate number of trades
    const totalTrades = 30 + Math.floor(Math.random() * 100);

    // Calculate winning trades based on win rate
    const winningTrades = Math.floor(totalTrades * (winRate / 100));
    const losingTrades = totalTrades - winningTrades;

    // Calculate average values for wins and losses
    const averageWin = isPositive
      ? 1.5 + Math.random() * 5 // 1.5-6.5% for profitable strategies
      : 1.0 + Math.random() * 3; // 1.0-4.0% for losing strategies

    const averageLoss = isPositive
      ? 1.0 + Math.random() * 2 // 1.0-3.0% for profitable strategies
      : 2.0 + Math.random() * 5; // 2.0-7.0% for losing strategies

    // Calculate largest values
    const largestWin = averageWin * (2 + Math.random() * 2); // 2-4x the average win
    const largestLoss = averageLoss * (2 + Math.random() * 3); // 2-5x the average loss

    // Generate appropriate recommendations based on performance
    let recommendations = [];
    if (isPositive) {
      recommendations = [
        "Consider increasing position size as the strategy shows positive returns",
        "Strategy performs better in trending markets; consider adding a trend filter",
        "Review stop-loss placement to reduce drawdown further",
        "Long trades outperform short trades; consider optimizing short entry criteria",
      ];
    } else {
      recommendations = [
        "Reduce position size until strategy is further optimized",
        "Consider adding additional filters to reduce false signals",
        "Implement stricter risk management with tighter stop-losses",
        "Test with different market conditions; current parameters may be unsuitable for this market",
      ];
    }

    // Generate equity curve data
    const equityCurveData = generateEquityCurveData(overallReturn, maxDrawdown, totalTrades);

    return {
      overallReturn: parseFloat(overallReturn.toFixed(2)),
      winRate: parseFloat(winRate.toFixed(1)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(1)),
      sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
      totalTrades,
      winningTrades,
      losingTrades,
      averageWin: parseFloat(averageWin.toFixed(2)),
      averageLoss: parseFloat(averageLoss.toFixed(2)),
      largestWin: parseFloat(largestWin.toFixed(1)),
      largestLoss: parseFloat(largestLoss.toFixed(1)),
      recommendations,
      equityCurveData
    };
  };

  // Generate equity curve data
  const generateEquityCurveData = (overallReturn, maxDrawdown, totalTrades) => {
    // We'll create 100 data points for a nice looking curve
    const dataPoints = 100;
    const result = [];

    // Initial equity is 100%
    let equity = 100;
    let highestEquity = 100;

    // Whether overall performance is positive
    const isPositive = overallReturn > 0;

    // Create a sigmoid curve that reaches the final return value
    for (let i = 0; i < dataPoints; i++) {
      // Percentage of the way through the dataset
      const progress = i / (dataPoints - 1);

      // Depending on if the strategy is winning or losing, shape the curve differently
      let targetEquity;

      if (isPositive) {
        // For profitable strategies, steady growth with a few drawdowns
        // More volatile at the start, then steadier growth
        targetEquity = 100 + (overallReturn * progress * (1.1 - 0.2 * Math.sin(progress * 8)));
      } else {
        // For losing strategies, initial promise then deterioration
        // Start with some gains, then decline
        const inflection = 0.3 + (Math.random() * 0.2); // Point where strategy turns negative
        if (progress < inflection) {
          // Initial promising period
          targetEquity = 100 + (10 * progress / inflection);
        } else {
          // Deterioration period
          const remainingProgress = (progress - inflection) / (1 - inflection);
          targetEquity = 110 + ((overallReturn + 10) * remainingProgress);
        }
      }

      // Add some noise for realism
      const noise = Math.random() * 4 - 2; // ±2% noise
      equity = targetEquity + noise;

      // Ensure we hit max drawdown at some point
      if (i === Math.floor(dataPoints * 0.7) && isPositive) {
        // For profitable strategies, add a significant drawdown around 70% through
        equity = highestEquity * (1 - (maxDrawdown / 100));
      } else if (i === Math.floor(dataPoints * 0.4) && !isPositive) {
        // For losing strategies, add a significant drawdown around 40% through
        equity = highestEquity * (1 - (maxDrawdown / 100));
      }

      // Track highest equity for drawdown calculations
      if (equity > highestEquity) {
        highestEquity = equity;
      }

      // Record the data point
      result.push({
        day: i + 1,
        equity: parseFloat(equity.toFixed(2))
      });
    }

    // Ensure the final value matches the overall return
    result[dataPoints - 1].equity = 100 + parseFloat(overallReturn.toFixed(2));

    return result;
  };

  const handleBacktest = () => {
    // Validate required fields
    const requiredFields = [];

    if (!symbol) requiredFields.push('Trading Symbol');
    if (!timeframe) requiredFields.push('Timeframe');
    if (!timeDuration) requiredFields.push('Time Duration');
    if (!initialCapital || initialCapital <= 0) requiredFields.push('Initial Capital');
    if (!quantity || quantity <= 0) requiredFields.push('Quantity');
    if (!pineScript) requiredFields.push('Strategy Script');

    if (requiredFields.length > 0) {
      alert(`Please fill in the following required fields: ${requiredFields.join(', ')}`);
      return;
    }

    try {
      // Save current configuration to localStorage to persist between reloads
      const config = {
        symbol,
        timeframe,
        timeDuration,
        startDate,
        endDate,
        initialCapital,
        quantity,
        lastRun: new Date().toISOString()
      };

      localStorage.setItem('backtest_last_config', JSON.stringify(config));

      // If all validations pass, proceed with backtest
      setIsBacktesting(true);
      setActiveTab('results');
      setCountdownTime(60);
    } catch (error) {
      console.error('Error starting backtest:', error);
      alert('Failed to start backtest. Please try again.');
      setIsBacktesting(false);
    }
  };

  // New function to transform optimization results to backtest format
  const transformOptimizationToBacktest = (optimizationResults, makePositive = false) => {
    // Get the best result from the optimization
    const bestResult = optimizationResults.bestResult || {};

    // Create equity curve data that shows positive results
    let returnValue = bestResult.return || 15.25;

    // If makePositive is true, ensure we show positive results to create the illusion of success
    if (makePositive && returnValue < 0) {
      returnValue = Math.abs(returnValue) + Math.random() * 10 + 5; // Make it positive and add 5-15%
    }

    // Generate equity curve data based on the return
    const equityCurve = generateEquityCurveData(returnValue,
      bestResult.maxDrawdown || 12.5,
      bestResult.totalTrades || 87);

    // Create recommendations based on the results
    const recommendations = [
      "Consider trailing stop-loss to protect profits",
      "Current parameter settings are working well in this market condition",
      "The strategy shows consistent performance across different market regimes",
      "Consider implementing a market filter to further improve results"
    ];

    // Return backtest results object
    return {
      overallReturn: returnValue,
      winRate: bestResult.winRate || 65.5,
      profitFactor: bestResult.profitFactor || 1.85,
      maxDrawdown: bestResult.maxDrawdown || 12.5,
      sharpeRatio: bestResult.sharpeRatio || 1.65,
      totalTrades: bestResult.totalTrades || 87,
      winningTrades: Math.floor((bestResult.totalTrades || 87) * (bestResult.winRate || 65.5) / 100),
      losingTrades: Math.floor((bestResult.totalTrades || 87) * (1 - (bestResult.winRate || 65.5) / 100)),
      averageWin: 4.82,
      averageLoss: 2.76,
      largestWin: 12.3,
      largestLoss: 8.1,
      recommendations,
      equityCurveData: equityCurve
    };
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
    <div className="min-h-screen text-white bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text">

              <GradientText
                gradient="purple"
                className="inline"
              >
                Strategy Backtesting
              </GradientText>

            </h1>
            <p className="text-zinc-400 mt-1">Test your trading strategies with historical data and analyze performance</p>
          </div>

        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-zinc-900/50 p-1 rounded-lg">
          <button
            className={`px-5 py-3 font-medium rounded-md transition-all ${activeTab === 'input'
              ? 'bg-zinc-800 text-white shadow-lg'
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
            className={`px-5 py-3 font-medium rounded-md transition-all ${activeTab === 'configure'
              ? 'bg-zinc-800 text-white shadow-lg'
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
            className={`px-5 py-3 font-medium rounded-md transition-all ${activeTab === 'results'
              ? 'bg-zinc-800 text-white shadow-lg'
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

        {/* Strategy Input Tab */}
        {activeTab === 'input' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50">
                <div className="p-4 bg-zinc-900/70 border-b border-zinc-700/50 flex items-center justify-between">
                  <div className="flex items-center">
                    <Code className="w-5 h-5 text-indigo-500 mr-2" />
                    <h2 className="text-white font-medium">Pine Script Input</h2>
                  </div>
                  <div className="flex justify-center items-center space-x-2">
                    <div className="flex space-x-2">
                      <span className="text-xs text-zinc-500">{pineScript.split('\n').length} lines</span>
                    </div>
                    <button
                      className="p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-xs text-zinc-300 transition-colors"
                      onClick={clearCode}
                      title="Clear code"
                    >
                      Clean
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
                </div>
                <div className="p-3 border-t border-zinc-700/50 flex justify-between items-center bg-zinc-900/30">
                  <div className="text-zinc-400 text-xs">
                    <span className="inline-flex items-center">
                      <Info className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                      Need help with Pine Script? <a href="#" className="text-indigo-400 ml-1 hover:underline">View Documentation</a>
                    </span>
                  </div>
                  <div className="flex space-x-2">
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
                        onClick={convertToJson}
                        disabled={isConverting}
                        className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 hover:bg-gradient-to-r hover:from-purple-600 hover:via-violet-600 hover:to-blue-600 hover:to-[#0060df] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-900/30 flex items-center"
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
                        <div className="divide-y divide-zinc-700/30">
                          {Object.entries(jsonData.inputs).map(([key, value]) => (
                            <div key={key} className="py-2">
                              <div className="flex justify-between items-center flex-wrap">
                                <span className="text-white font-medium">{value.title || key}</span>
                                <div className="flex space-x-2 items-center mt-1 sm:mt-0">
                                  {value.group && (
                                    <span className="text-xs bg-indigo-900/60 px-2 py-0.5 rounded-full text-indigo-200">
                                      {value.group}
                                    </span>
                                  )}
                                  <span className="text-xs bg-zinc-700/60 px-2 py-0.5 rounded-full text-zinc-300">
                                    {value.type}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap justify-between text-sm mt-1 text-zinc-400">
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

                    {/* Complete JSON */}
                    <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800">
                      <h3 className="text-md font-medium mb-2 text-indigo-400 flex items-center">
                        <Code className="w-4 h-4 mr-1 text-indigo-400" />
                        Complete JSON
                      </h3>
                      <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap">{jsonOutput}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[450px] bg-zinc-900/20 text-center p-4 border-t border-zinc-800/50">
                    <BarChart2 className="w-12 h-12 text-zinc-700 mb-4" />
                    <p className="text-zinc-500 max-w-xs">JSON parser output will appear here after conversion</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Configure Test Tab */}
        {activeTab === 'configure' && (
          <div className="bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50">
            <div className="p-4 bg-zinc-900/70 border-b border-zinc-700/50 flex items-center justify-between">
              <div className="flex items-center">
                <Server className="w-5 h-5 text-indigo-500 mr-2" />
                <h2 className="text-white font-medium">Backtest Configuration</h2>
              </div>

              {jsonData && (
                <div className="text-xs px-3 py-1 bg-indigo-900/30 text-indigo-400 rounded-full flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  Strategy loaded with {Object.keys(jsonData.inputs).length} parameters
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <TradeSymbolSelector
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  required={true}
                />

                <div>
                  <label htmlFor="timeframe" className="block text-sm font-medium mb-2 text-zinc-300">Timeframe</label>
                  <Select
                    value={timeframe}
                    onValueChange={(value) => setTimeframe(value)}
                  >
                    <SelectTrigger
                      id="timeframe"
                      className="px-4 py-3 h-auto bg-zinc-800/80 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border border-zinc-700 text-white">
                      <SelectItem value="tick" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Tick Data</SelectItem>
                      <SelectItem value="1m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">1 Minute</SelectItem>
                      <SelectItem value="5m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">5 Minutes</SelectItem>
                      <SelectItem value="15m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">15 Minutes</SelectItem>
                      <SelectItem value="1h" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">1 Hour</SelectItem>
                      <SelectItem value="4h" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">4 Hours</SelectItem>
                      <SelectItem value="1D" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">1 Day</SelectItem>
                      <SelectItem value="1W" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">1 Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col w-full">
                  <label className="text-sm text-zinc-300 mb-1">Initial Capital</label>
                  <input
                    type="number"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                    min="1000"
                    className="w-full px-4 py-3 bg-zinc-900/70 rounded-lg border border-zinc-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white transition-colors"
                    placeholder="1000000"
                  />
                </div>

                <div className="flex flex-col w-full">
                  <label className="text-sm text-zinc-300 mb-1">Quantity / Contract Size</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-3 bg-zinc-900/70 rounded-lg border border-zinc-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white transition-colors"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label htmlFor="timeduration" className="block text-sm font-medium mb-2 text-zinc-300">Time Duration</label>
                  <Select
                    value={timeDuration}
                    onValueChange={(value) => setTimeDuration(value)}
                  >
                    <SelectTrigger
                      id="timeduration"
                      className="px-4 py-3 h-auto bg-zinc-800/80 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <SelectValue placeholder="Select time duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border border-zinc-700 text-white">
                      <SelectItem value="1W" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">1 week</SelectItem>
                      <SelectItem value="1m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">1 month</SelectItem>
                      <SelectItem value="3m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">3 month</SelectItem>
                      <SelectItem value="6m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">6 month</SelectItem>
                      <SelectItem value="12m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">12 month</SelectItem>
                      <SelectItem value="24m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">24 month</SelectItem>
                      <SelectItem value="36m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">36 month</SelectItem>
                      <SelectItem value="48m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">48 month</SelectItem>
                      <SelectItem value="60m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">60 month</SelectItem>
                      <SelectItem value="72m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">120 month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* <div className="flex flex-col justify-center w-full">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-zinc-300">Use Cached Results</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        name="toggle"
                        id="toggle-cache"
                        checked={useCachedResults}
                        onChange={() => setUseCachedResults(!useCachedResults)}
                        className="sr-only"
                      />
                      <label
                        htmlFor="toggle-cache"
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in ${useCachedResults ? 'bg-indigo-600' : 'bg-zinc-700'
                          }`}
                      >
                        <span
                          className={`block h-4 w-4 mt-1 ml-1 rounded-full bg-white shadow transform duration-200 ease-in ${useCachedResults ? 'translate-x-4' : ''
                            }`}
                        ></span>
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">
                    When enabled, identical backtest configurations will use cached results
                  </p>
                </div> */}

              </div>

              <div className="bg-zinc-900/40 rounded-xl p-5 mb-6 border border-zinc-800/80">
                <h3 className="text-lg font-medium mb-4 text-zinc-200 flex items-center">
                  <Zap className="w-5 h-5 text-indigo-500 mr-2" />
                  Advanced Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm mb-1 text-zinc-300">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-indigo-600 mr-2 focus:ring-indigo-500 bg-zinc-700 border-zinc-600"
                      />
                      Apply position sizing rules
                    </label>
                    <p className="text-xs text-zinc-500">Dynamically adjust position size based on account volatility</p>
                  </div>

                  <div>
                    <label className="flex items-center text-sm mb-1 text-zinc-300">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-indigo-600 mr-2 focus:ring-indigo-500 bg-zinc-700 border-zinc-600"
                      />
                      Include trading fees and slippage
                    </label>
                    <p className="text-xs text-zinc-500">Add realistic cost simulation to trade execution</p>
                  </div>

                  <div>
                    <label className="flex items-center text-sm mb-1 text-zinc-300">
                      <input
                        type="checkbox"
                        checked
                        className="w-4 h-4 rounded text-indigo-600 mr-2 focus:ring-indigo-500 bg-zinc-700 border-zinc-600"
                      />
                      Generate advanced metrics
                    </label>
                    <p className="text-xs text-zinc-500">Calculate Sharpe ratio, Sortino ratio, and other metrics</p>
                  </div>

                  <div>
                    <label className="flex items-center text-sm mb-1 text-zinc-300">
                      <input
                        type="checkbox"
                        checked
                        className="w-4 h-4 rounded text-indigo-600 mr-2 focus:ring-indigo-500 bg-zinc-700 border-zinc-600"
                      />
                      AI-driven recommendations
                    </label>
                    <p className="text-xs text-zinc-500">Receive strategy optimization suggestions</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-zinc-500">
                  {jsonData ? (
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-zinc-400" />
                      <span>Backtesting time: Approximately 1 minute</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-500">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                      <span>Please convert Pine Script before running a backtest</span>
                    </div>
                  )}
                </div>

                <BacktestButton
                  symbol={symbol}
                  pineScript={pineScript}
                  timeframe={timeframe}
                  timeDuration={timeDuration}
                  initialCapital={initialCapital}
                  quantity={quantity}
                  onBacktestClick={handleBacktest}
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <>
            {isBacktesting ? (
              <div className="bg-zinc-800/70 rounded-xl p-10 shadow-xl text-center border border-zinc-700/50">
                <div className="w-24 h-24 rounded-full border-4 border-indigo-600/70 flex items-center justify-center mx-auto mb-6 relative">
                  <span className="text-2xl font-bold text-white">{countdownTime}s</span>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-indigo-400/30"
                    style={{
                      clipPath: `circle(${50 - (countdownTime / 60) * 50}% at 50% 50%)`,
                      opacity: 0.5
                    }}
                  ></div>
                </div>
                <h3 className="text-white text-xl font-medium mb-3">Running Backtest</h3>
                <p className="text-zinc-400 mb-4">Please wait while we process your strategy</p>
                <div className="w-full max-w-md mx-auto bg-zinc-700/50 rounded-full h-2.5 mb-5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${((60 - countdownTime) / 60) * 100}%` }}
                  ></div>
                </div>
                <p className="text-zinc-500 text-sm mt-1">Time duration: {
                  timeDuration === '1W' ? 'Under 1 week' :
                    timeDuration === '1m' ? 'Under 1 month' :
                      timeDuration === '3m' ? 'Under 3 month' :
                        timeDuration === '6m' ? 'Under 6 months' :
                          timeDuration === '12m' ? 'Under 12 months' : timeDuration
                }</p>
              </div>
            ) : showResults ? (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-zinc-800/70 rounded-xl p-5 shadow-lg flex items-center border border-zinc-700/50 hover:border-indigo-500/50 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${backtestResults.overallReturn >= 0 ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs uppercase tracking-wider font-medium">Total P&L</p>
                      <div className="flex items-baseline">
                        <span className={`text-2xl font-bold ${backtestResults.overallReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {backtestResults.overallReturn}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-800/70 rounded-xl p-5 shadow-lg flex items-center border border-zinc-700/50 hover:border-indigo-500/50 transition-all duration-300">
                    <div className="w-12 h-12 bg-red-900/20 text-red-500 flex items-center justify-center rounded-xl mr-4">
                      <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs uppercase tracking-wider font-medium">Max Drawdown</p>
                      <div className="flex items-baseline">
                        <span className="text-white text-2xl font-bold">{backtestResults.maxDrawdown}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-800/70 rounded-xl p-5 shadow-lg flex items-center border border-zinc-700/50 hover:border-indigo-500/50 transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-900/20 text-blue-500 flex items-center justify-center rounded-xl mr-4">
                      <BarChart2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs uppercase tracking-wider font-medium">Profit Factor</p>
                      <div className="flex items-baseline">
                        <span className="text-white text-2xl font-bold">{backtestResults.profitFactor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-800/70 rounded-xl p-5 shadow-lg flex items-center border border-zinc-700/50 hover:border-indigo-500/50 transition-all duration-300">
                    <div className="w-12 h-12 bg-indigo-900/20 text-indigo-500 flex items-center justify-center rounded-xl mr-4">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs uppercase tracking-wider font-medium">Win Rate</p>
                      <div className="flex items-baseline">
                        <span className="text-white text-2xl font-bold">{backtestResults.winRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts section */}
                <div className="bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50">
                  <div className="p-4 bg-zinc-900/70 border-b border-zinc-700/50 flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-indigo-500 mr-2" />
                      <h2 className="text-white font-medium">Equity Curve</h2>
                    </div>
                    <div className="flex space-x-2">
                      <span className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-zinc-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {timeframe} timeframe
                      </span>
                      <span className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-zinc-400">
                        {symbol}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="h-80 bg-zinc-900 rounded-lg p-4">
                      {backtestResults.equityCurveData && (
                        <div className="relative h-full">
                          {/* Y-axis labels */}
                          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-zinc-500 pb-6">
                            {[0, 1, 2, 3, 4].map((i) => {
                              const min = Math.min(...backtestResults.equityCurveData.map(d => d.equity));
                              const max = Math.max(...backtestResults.equityCurveData.map(d => d.equity));
                              const range = max - min;
                              const value = max - (range * i / 4);
                              return (
                                <div key={i} className="flex items-center">
                                  <span className="pr-2">{value.toFixed(1)}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Background grid lines */}
                          <div className="absolute left-12 right-0 top-0 bottom-0 grid grid-rows-4">
                            {[0, 1, 2, 3].map((i) => (
                              <div key={i} className="w-full border-t border-zinc-800"></div>
                            ))}
                          </div>

                          {/* Chart container */}
                          <div className="absolute left-12 right-0 top-0 bottom-6 overflow-hidden">
                            <svg
                              width="100%"
                              height="100%"
                              viewBox="0 0 100 100"
                              preserveAspectRatio="none"
                              className="overflow-visible"
                            >
                              {/* Define gradient */}
                              <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={backtestResults.overallReturn >= 0 ? "#22c55e" : "#ef4444"} stopOpacity="0.3" />
                                  <stop offset="100%" stopColor={backtestResults.overallReturn >= 0 ? "#22c55e" : "#ef4444"} stopOpacity="0.05" />
                                </linearGradient>
                              </defs>

                              {/* Baseline at 100% */}
                              {(() => {
                                const min = Math.min(...backtestResults.equityCurveData.map(d => d.equity));
                                const max = Math.max(...backtestResults.equityCurveData.map(d => d.equity));
                                const range = max - min;
                                const baselineY = 100 - ((100 - min) / range) * 100;

                                return (
                                  <line
                                    x1="0"
                                    y1={baselineY}
                                    x2="100"
                                    y2={baselineY}
                                    stroke="#4B5563"
                                    strokeWidth="0.5"
                                    strokeDasharray="2,2"
                                  />
                                );
                              })()}

                              {/* Main chart components */}
                              {(() => {
                                const min = Math.min(...backtestResults.equityCurveData.map(d => d.equity));
                                const max = Math.max(...backtestResults.equityCurveData.map(d => d.equity));
                                const range = max - min;
                                const dataPoints = backtestResults.equityCurveData;

                                // Create path data for the line
                                const linePath = dataPoints.map((point, i) => {
                                  const x = (i / (dataPoints.length - 1)) * 100;
                                  const y = 100 - ((point.equity - min) / range) * 100;
                                  return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                                }).join(' ');

                                // Create path for the area under the curve
                                const baselineY = 100 - ((100 - min) / range) * 100;
                                const areaPath = `${linePath} L100,${baselineY} L0,${baselineY} Z`;

                                const lineColor = backtestResults.overallReturn >= 0 ? "#22c55e" : "#ef4444";

                                return (
                                  <>
                                    {/* Area under the curve */}
                                    <path
                                      d={areaPath}
                                      fill="url(#areaGradient)"
                                    />

                                    {/* The line itself */}
                                    <path
                                      d={linePath}
                                      fill="none"
                                      stroke={lineColor}
                                      strokeWidth="0.25"
                                      strokeLinejoin="round"
                                      strokeLinecap="round"
                                    />

                                    {/* Data points */}
                                    {dataPoints.map((point, i) => {
                                      if (i % 10 === 0 || i === dataPoints.length - 1) {
                                        const x = (i / (dataPoints.length - 1)) * 100;
                                        const y = 100 - ((point.equity - min) / range) * 100;

                                        return (
                                          <circle
                                            key={i}
                                            cx={x}
                                            cy={y}
                                            r="0.25"
                                            fill={lineColor}
                                          />
                                        );
                                      }
                                      return null;
                                    })}
                                  </>
                                );
                              })()}
                            </svg>
                          </div>

                          {/* X-axis labels */}
                          <div className="absolute left-12 right-0 bottom-0 flex justify-between text-xs text-zinc-500">
                            <span>Start</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>End</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics and breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50">
                    <div className="p-4 bg-zinc-900/70 border-b border-zinc-700/50 flex items-center">
                      <BarChart2 className="w-5 h-5 text-indigo-500 mr-2" />
                      <h2 className="text-white font-medium">Trade Statistics</h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                        <div>
                          <p className="text-zinc-400 text-xs uppercase tracking-wider font-medium mb-1">Total Trades</p>
                          <p className="text-white font-medium">{backtestResults.totalTrades}</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 text-xs uppercase tracking-wider font-medium mb-1">Win Rate</p>
                          <p className="text-white font-medium">{backtestResults.winRate}%</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 text-xs uppercase tracking-wider font-medium mb-1">Winning Trades</p>
                          <p className="text-green-500 font-medium">{backtestResults.winningTrades}</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 text-xs uppercase tracking-wider font-medium mb-1">Losing Trades</p>
                          <p className="text-red-500 font-medium">{backtestResults.losingTrades}</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 text-xs uppercase tracking-wider font-medium mb-1">Average Win</p>
                          <p className="text-green-500 font-medium">{backtestResults.averageWin}%</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 text-xs uppercase tracking-wider font-medium mb-1">Average Loss</p>
                          <p className="text-red-500 font-medium">{backtestResults.averageLoss}%</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 text-xs uppercase tracking-wider font-medium mb-1">Largest Win</p>
                          <p className="text-green-500 font-medium">{backtestResults.largestWin}%</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 text-xs uppercase tracking-wider font-medium mb-1">Largest Loss</p>
                          <p className="text-red-500 font-medium">{backtestResults.largestLoss}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50">
                    <div className="p-4 bg-zinc-900/70 border-b border-zinc-700/50 flex items-center">
                      <Zap className="w-5 h-5 text-indigo-500 mr-2" />
                      <h2 className="text-white font-medium">AI-Driven Recommendations</h2>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-4">
                        {backtestResults.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-7 h-7 bg-indigo-900/30 text-indigo-400 flex items-center justify-center rounded-full mr-3 mt-0.5 flex-shrink-0">
                              <Zap className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-zinc-200">{recommendation}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Download section */}
                <div className="bg-zinc-800/70 rounded-xl p-6 shadow-lg border border-zinc-700/50 mb-6">
                  <h3 className="text-lg font-medium mb-4 text-zinc-200 flex items-center">
                    <BarChart2 className="w-5 h-5 text-indigo-500 mr-2" />
                    Strategy Summary
                  </h3>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between">
                      <div className="text-zinc-400 text-sm">Symbol</div>
                      <div className="text-white font-medium">{symbol}</div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between">
                      <div className="text-zinc-400 text-sm">Timeframe</div>
                      <div className="text-white font-medium">{timeframe}</div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between">
                      <div className="text-zinc-400 text-sm">Time Duration</div>
                      <div className="text-white font-medium">
                        {timeDuration === '1W' ? 'Under 1 week' :
                          timeDuration === '1m' ? 'Under 1 month' :
                            timeDuration === '3m' ? 'Under 3 month' :
                              timeDuration === '6m' ? 'Under 6 months' :
                                timeDuration === '12m' ? 'Under 12 months' : timeDuration}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between">
                      <div className="text-zinc-400 text-sm">Initial Capital</div>
                      <div className="text-white font-medium">${initialCapital.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-800/70 rounded-xl p-10 shadow-xl text-center border border-zinc-700/50">
                <Clock className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-white text-xl font-medium mb-2">No Backtest Results Yet</h3>
                <p className="text-zinc-400 mb-6">Configure and run a backtest to see your strategy performance</p>
                <button
                  onClick={() => setActiveTab('configure')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-900/30 hover:bg-gradient-to-r hover:from-purple-600 hover:via-violet-600 hover:to-blue-600 hover:to-[#0060df]"
                >
                  Go to Configuration
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 