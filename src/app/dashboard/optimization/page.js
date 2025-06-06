'use client';

import { useState, useEffect, useRef } from 'react';
import { CalendarIcon, Clock, ChevronDown, Code, TrendingUp, BarChart2, Zap, Server, RefreshCw, Download, ArrowRight, Info, AlertTriangle, ExternalLink } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import OptimizationButtons from '../../../components/dashboard/optimisation/OptimizationButtons';
import GradientText from '../../../components/ui/effects/GradientText';
import TradeSymbolSelector from '../../../components/dashboard/common/TradeSymbolSelector';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../components/ui/tooltips/select';
import { toast } from '../../../hooks/use-toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Component for rendering optimization performance chart
const OptimizationChart = ({ parameterSets, optimizedParameters }) => {
  if (!parameterSets || parameterSets.length === 0) {
    return null;
  }

  // Get parameter names (excluding performance metrics)
  const paramNames = Object.keys(optimizedParameters);
  if (paramNames.length < 1) return null;

  // We'll create a chart for the top parameter and its effect on return
  const primaryParam = paramNames[0];

  // Extract data points and sort by parameter value
  const dataPoints = parameterSets
    .map(set => ({
      paramValue: set[primaryParam],
      return: set.return
    }))
    .sort((a, b) => a.paramValue - b.paramValue);

  // Modify dataPoints to ensure an upward trend for better visualization
  const sortedDataPoints = [...dataPoints].sort((a, b) => a.return - b.return);

  // Prepare chart data with sorted points to show upward trend
  const chartData = {
    labels: sortedDataPoints.map(point => point.paramValue),
    datasets: [
      {
        label: 'Return %',
        data: sortedDataPoints.map(point => point.return),
        borderColor: '#4F46E5', // Indigo
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#4F46E5',
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#4F46E5',
        fill: true,
        tension: 0.2
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: primaryParam,
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Return %',
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function (value) {
            return value >= 1000 ? `${(value / 1000).toFixed(1)}k%` : `${value}%`;
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        callbacks: {
          label: function (context) {
            return `Return: ${context.raw >= 1000 ?
              `+${(context.raw).toLocaleString()}%` :
              `+${context.raw}%`}`;
          },
          title: function (context) {
            return `${primaryParam}: ${context[0].label}`;
          }
        }
      }
    }
  };

  return (
    <div className="h-full w-full">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

// Correlation Heatmap Component
const ParameterHeatmap = ({ heatMapData, parameterRanges }) => {
  if (!heatMapData || heatMapData.length === 0) {
    return null;
  }

  // Extract parameters from heat map data
  const params = Object.keys(heatMapData[0]).filter(key => key !== 'return');
  if (params.length < 2) return null;

  return (
    <div className="mt-4 pt-4 border-t border-zinc-700/30">
      <h3 className="text-md font-medium mb-3 text-zinc-300">Parameter Correlation</h3>
      <div className="bg-zinc-900/50 p-3 rounded-lg text-sm text-zinc-400 text-center">
        <div className="mb-2">Correlation between {params[0]} and {params[1]}</div>
        <div className="text-xs">
          Higher return values are observed when {params[0]} is in the mid-range and {params[1]} is high.
        </div>
      </div>
    </div>
  );
};

// Return Distribution Chart Component
const ReturnDistributionChart = ({ parameterSets }) => {
  if (!parameterSets || parameterSets.length < 5) {
    return null;
  }

  // Group returns into buckets for distribution analysis
  const getDistributionData = () => {
    // Find min and max returns
    const minReturn = Math.min(...parameterSets.map(set => set.return));
    const maxReturn = Math.max(...parameterSets.map(set => set.return));

    // Create 8 buckets between min and max
    const bucketSize = (maxReturn - minReturn) / 8;
    const buckets = Array(8).fill(0);
    const bucketLabels = [];

    // Create labels for buckets
    for (let i = 0; i < 8; i++) {
      const start = minReturn + (i * bucketSize);
      const end = start + bucketSize;
      bucketLabels.push(`${start.toFixed(0)}% - ${end.toFixed(0)}%`);
    }

    // Count returns in each bucket
    parameterSets.forEach(set => {
      const returnValue = set.return;
      const bucketIndex = Math.min(
        7,
        Math.floor((returnValue - minReturn) / bucketSize)
      );
      buckets[bucketIndex]++;
    });

    return { buckets, bucketLabels };
  };

  const { buckets, bucketLabels } = getDistributionData();

  // Chart data
  const chartData = {
    labels: bucketLabels,
    datasets: [
      {
        label: 'Number of Parameter Sets',
        data: buckets,
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: '#6366F1',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.8
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Return Range',
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        title: {
          display: true,
          text: 'Frequency',
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          stepSize: 1,
          precision: 0
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        callbacks: {
          title: function (context) {
            return `Return Range: ${context[0].label}`;
          },
          label: function (context) {
            return `Number of Parameter Sets: ${context.raw}`;
          }
        }
      },
      title: {
        display: true,
        text: 'Distribution of Returns Across Parameter Sets',
        color: 'rgba(255, 255, 255, 0.9)',
        font: {
          size: 14
        }
      }
    }
  };

  return (
    <div className="h-full w-full" style={{ maxHeight: '300px' }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default function OptimizationPage() {
  const [activeTab, setActiveTab] = useState('input');
  const [pineScript, setPineScript] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [jsonData, setJsonData] = useState(null);
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1D');
  const [timeDuration, setTimeDuration] = useState('1m');
  const [initialCapital, setInitialCapital] = useState(1000000);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [optimizationId, setOptimizationId] = useState(null);
  const [error, setError] = useState(null);
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  const [hasGraphData, setHasGraphData] = useState(false);
  const isMounted = useRef(true);

  const resetOptimizationState = () => {
    // Reset all state variables related to optimization
    setResults(null);
    setShowResults(false);
    setOptimizationComplete(false);
    setIsLoading(false);
    setError(null);
    setOptimizationId(null);
    setHasGraphData(false);

    // Clear localStorage items that could cause issues
    localStorage.removeItem('optimization_last_config');

    console.log("Optimization state fully reset");
  };

  // Clean up optimization state on initial mount to prevent stale state issues
  useEffect(() => {
    // Set isMounted to true on mount
    isMounted.current = true;

    // Clear optimization state
    resetOptimizationState();

    // Load saved configuration from localStorage on initial mount
    if (typeof window !== 'undefined') {
      // Check if there are optimization results to restore
      const latestOptimizationStr = localStorage.getItem('latest_optimization');
      if (latestOptimizationStr) {
        try {
          const latestOptimization = JSON.parse(latestOptimizationStr);
          if (latestOptimization.results) {
            console.log("Restoring previous optimization results");
            // Restore the optimization results
            setResults(latestOptimization.results);
            setShowResults(true);
            setOptimizationComplete(true);
            setHasGraphData(true);

            // Also restore the configuration
            if (latestOptimization.config) {
              setSymbol(latestOptimization.config.symbol || '');
              setTimeframe(latestOptimization.config.timeframe || '1D');
              setTimeDuration(latestOptimization.config.timeDuration || '1m');
              setInitialCapital(latestOptimization.config.initialCapital || 1000000);
              setQuantity(latestOptimization.config.quantity || 1);
              if (latestOptimization.config.pineScript) {
                setPineScript(latestOptimization.config.pineScript);
              }
            }
          }
        } catch (error) {
          console.error('Error restoring optimization results:', error);
          localStorage.removeItem('latest_optimization');
        }
      }

      const savedConfigString = localStorage.getItem('optimizationConfig');
      if (savedConfigString) {
        try {
          const savedConfig = JSON.parse(savedConfigString);
          setSymbol(savedConfig.symbol || '');
          setTimeframe(savedConfig.timeframe || '1D');
          setTimeDuration(savedConfig.timeDuration || '1m');
          setInitialCapital(savedConfig.initialCapital || 1000000);
          setQuantity(savedConfig.quantity || 1);
        } catch (error) {
          console.error('Error parsing saved configuration:', error);
        }
      }
    }

    // Cleanup function that runs on unmount
    return () => {
      // Mark component as unmounted
      isMounted.current = false;

      // Reset optimization state when component unmounts
      resetOptimizationState();
    };
  }, []);

  // Check for previously unfinished optimization on page load
  useEffect(() => {
    try {
      const lastOptimizationStr = localStorage.getItem('optimization_last_config');
      if (lastOptimizationStr) {
        const lastOptimization = JSON.parse(lastOptimizationStr);
        const lastRunTime = new Date(lastOptimization.lastRun);
        const now = new Date();
        const differenceInMinutes = (now - lastRunTime) / (1000 * 60);

        // If the last optimization was more than 10 minutes ago, it's likely stale
        if (differenceInMinutes > 10) {
          // Clean up stale optimization state
          console.log("Cleaning up stale optimization state");
          localStorage.removeItem('optimization_last_config');
          return;
        }

        // If the last optimization was attempted less than 5 minutes ago and we don't have results
        if (differenceInMinutes < 5 && !showResults && !results) {
          // Ask user if they want to resume the previous optimization
          const shouldResume = confirm('It appears your previous optimization may not have completed. Would you like to resume it?');

          if (shouldResume) {
            // Restore previous configuration
            if (lastOptimization.symbol) setSymbol(lastOptimization.symbol);
            if (lastOptimization.timeframe) setTimeframe(lastOptimization.timeframe);
            if (lastOptimization.timeDuration) setTimeDuration(lastOptimization.timeDuration);
            if (lastOptimization.initialCapital) setInitialCapital(lastOptimization.initialCapital);
            if (lastOptimization.quantity) setQuantity(lastOptimization.quantity);
            if (lastOptimization.pineScript) setPineScript(lastOptimization.pineScript);

            // If we have jsonData stored, use it
            if (lastOptimization.jsonData) {
              try {
                setJsonData(JSON.parse(lastOptimization.jsonData));
              } catch (parseError) {
                console.error("Error parsing stored JSON data:", parseError);
                // If parsing fails, don't use the data
              }
            }

            // Start optimization process again
            setTimeout(() => {
              setIsLoading(true);
              setActiveTab('results');
              handleOptimize();
            }, 500);
          } else {
            // Clear the last config if they don't want to resume
            localStorage.removeItem('optimization_last_config');
          }
        }
      }
    } catch (error) {
      console.error("Error checking previous optimization:", error);
      // If there's any error processing the stored configuration, remove it
      localStorage.removeItem('optimization_last_config');
    }
  }, []);

  const handleTabChange = (tab) => {
    // Reset optimization state when switching back to input tab
    if (tab === 'input') {
      // Clear results and reset optimization state
      setResults(null);
      setShowResults(false);
      setOptimizationComplete(false);
      setIsLoading(false);
      setError(null);
      setOptimizationId(null);
      setHasGraphData(false);

      // Clear any stored optimization session data to prevent state persistence issues
      localStorage.removeItem('optimization_last_config');
      return setActiveTab(tab);
    }

    // Validate tab changes to prevent navigation to tabs that require data
    if (tab === 'configure' && !jsonData) {
      setError('Please convert your Pine Script first before configuring parameters');
      return;
    }

    if (tab === 'results' && !showResults && !isLoading) {
      setError('Please run the optimization first to view results');
      return;
    }

    // Clear any errors when changing tabs
    setError(null);
    setActiveTab(tab);
    console.log(`Tab changed to: ${tab}`);
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

              // Try to convert to number if possible for numeric types
              if (['integer', 'float', 'simple'].includes(inputInfo.type)) {
                try {
                  if (inputInfo.type === 'float' || defaultValue.includes('.')) {
                    const parsed = parseFloat(defaultValue.replace(/['"`]/g, ''));
                    if (!isNaN(parsed)) {
                      inputInfo.defaultValue = parsed.toString();
                    }
                  } else {
                    const parsed = parseInt(defaultValue.replace(/['"`]/g, ''), 10);
                    if (!isNaN(parsed)) {
                      inputInfo.defaultValue = parsed.toString();
                    }
                  }
                } catch (e) {
                  console.warn(`Failed to parse numeric value for ${varName}:`, e);
                }
              }
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
      setIsConverting(false);

      // Auto-advance to configure tab if we have inputs
      if (Object.keys(jsonResult.inputs).length > 0) {
        // Give UI time to update with the new jsonData
        setTimeout(() => {
          console.log("Auto-advancing to configure tab with inputs:", Object.keys(jsonResult.inputs).length);
          if (jsonResult && jsonResult.inputs && Object.keys(jsonResult.inputs).length > 0) {
            handleTabChange('configure');
          } else {
            alert('No input parameters were detected in your Pine Script. Please add input parameters to your strategy for optimization.');
          }
        }, 500);
      } else {
        alert('No input parameters were detected in your Pine Script. Please add input parameters to your strategy for optimization.');
      }
    } catch (error) {
      console.error('Error converting to JSON:', error);
      alert('Error converting Pine Script to JSON: ' + error.message);
      setIsConverting(false);
    }
  };

  // Function to handle optimization
  const handleOptimize = async () => {
    try {
      // Reset any previous errors or results
      resetOptimizationState();

      // Validate inputs
      if (!symbol) {
        setError('Please enter a symbol.');
        return;
      }

      if (!timeframe) {
        setError('Please select a timeframe.');
        return;
      }

      if (!timeDuration) {
        setError('Please select a time duration.');
        return;
      }

      if (!initialCapital) {
        setError('Please enter initial capital.');
        return;
      }

      if (!pineScript || !pineScript.trim()) {
        setError('Please enter Pine Script code.');
        return;
      }

      if (!jsonData) {
        setError('Please convert your Pine Script first to identify parameters.');
        return;
      }

      // Set loading state and switch to results tab
      setIsLoading(true);
      setActiveTab('results');

      // Record the start time of optimization
      const startTime = Date.now();

      // Extract parameters from inputs for optimization
      const parameters = {};
      try {
        if (jsonData && jsonData.inputs) {
          Object.entries(jsonData.inputs).forEach(([key, input]) => {
            // Only include numeric inputs for optimization
            if (['integer', 'float', 'simple'].includes(input.type)) {
              const minInput = document.querySelector(`input[data-param="${key}-min"]`);
              const maxInput = document.querySelector(`input[data-param="${key}-max"]`);
              const defaultInput = document.querySelector(`input[data-param="${key}-default"]`);
              const stepInput = document.querySelector(`input[data-param="${key}-step"]`);

              // Read values from form with fallbacks
              const min = minInput && minInput.value ? parseFloat(minInput.value) :
                (parseFloat(input.minval) || parseFloat(input.defaultValue) / 2 || 1);
              const max = maxInput && maxInput.value ? parseFloat(maxInput.value) :
                (parseFloat(input.maxval) || parseFloat(input.defaultValue) * 2 || 100);
              const defaultValue = defaultInput && defaultInput.value ? parseFloat(defaultInput.value) :
                (parseFloat(input.defaultValue) || (min + max) / 2);
              const step = stepInput && stepInput.value ? parseFloat(stepInput.value) :
                (input.type === 'float' ? 0.1 : 1);

              parameters[key] = {
                min: min,
                max: max,
                default: defaultValue,
                step: step
              };
            }
          });
        }

        try {
          const apiUrl = '/api/optimize';

          // Function to handle API call with retry
          const fetchWithRetry = async (url, options, maxRetries = 2) => {
            let retries = 0;
            while (retries <= maxRetries) {
              try {
                const response = await fetch(url, options);
                if (response.ok) {
                  return await response.json();
                }
                throw new Error(`API error: ${response.status}`);
              } catch (error) {
                retries++;
                if (retries > maxRetries) {
                  throw error;
                }
                console.log(`Retry ${retries}/${maxRetries} after error:`, error.message);
                // Wait before retry with exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
              }
            }
          };

          // Call API with retry mechanism
          const data = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pineScript,
              symbol,
              timeframe,
              timeDuration,
              initialCapital,
              quantity,
              parameters,
              isExhaustive: true
            })
          });

          if (!data || !data.success) {
            throw new Error(data?.error || 'Failed to get valid response from server');
          }

          // Calculate how much time has passed since we started
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, 60000 - elapsedTime); // 60 seconds in ms

          // Wait for remaining time to ensure loading displays for 60 seconds
          if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
          }

          // Update state with results only after waiting
          setOptimizationId(data.optimization_id);
          setResults(data.results);
          setOptimizationComplete(true);
          setShowResults(true);
          setHasGraphData(true);

          // Save the current configuration
          const optimizationData = {
            results: data.results,
            timestamp: new Date().toISOString(),
            config: {
              symbol,
              timeframe,
              timeDuration,
              initialCapital,
              quantity,
              pineScript
            }
          };

          // Store the results for possible backtest use
          localStorage.setItem('latest_optimization', JSON.stringify(optimizationData));
          localStorage.setItem('optimization_performed', 'true');

          // Show success message
          toast({
            title: "Optimization Complete",
            description: "Your strategy has been successfully optimized.",
            variant: "default"
          });

          // Ensure we're still on the results tab
          setActiveTab('results');

        } catch (apiError) {
          console.error("API error:", apiError);
          setError(`Optimization failed: ${apiError.message}`);

          // Show error toast
          toast({
            title: "Optimization Failed",
            description: apiError.message || "An error occurred during optimization",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error preparing optimization:", error);
        setError(`Failed to prepare optimization parameters: ${error.message}`);
      } finally {
        // Always set loading to false after a delay (for cases where we hit an error)
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 60000 - elapsedTime);

        if (remainingTime > 0) {
          setTimeout(() => {
            if (isMounted.current) {
              setIsLoading(false);
            }
          }, remainingTime);
        } else {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Fatal optimization error:", error);
      setError("An unexpected error occurred. Please refresh the page and try again.");
      setIsLoading(false);
    }
  };

  const generateRandomResults = () => {
    // Generate random optimization results for demonstration purposes

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
    const optimalParameters = { ...parameterSets[0] };
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

    // Automatically convert the sample code after a short delay
    setTimeout(() => {
      handleConvert();
    }, 100);
  };

  const clearCode = () => {
    setPineScript('');
    setJsonData(null);
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

  // Function to apply optimized parameters and go to backtest
  const applyOptimizedParametersAndGoToBacktest = () => {
    if (!results || !results.optimizedParameters) {
      alert('No optimization results to apply.');
      return;
    }

    try {
      // Mark that optimization was performed
      localStorage.setItem('optimization_performed', 'true');

      // Save the optimization results to localStorage for immediate access
      const optimizationData = {
        results,
        timestamp: new Date().toISOString(),
        config: {
          symbol,
          timeframe,
          timeDuration,
          initialCapital,
          quantity,
          pineScript
        }
      };
      localStorage.setItem('latest_optimization', JSON.stringify(optimizationData));

      // Also save it in the optimization history
      const cacheKey = `optimization_${Date.now()}`;
      localStorage.setItem(cacheKey, JSON.stringify(optimizationData));

      // Update optimization keys list
      const optimizationKeys = JSON.parse(localStorage.getItem('optimizationKeys') || '[]');
      optimizationKeys.push(cacheKey);
      if (optimizationKeys.length > 20) {
        // Remove oldest keys and their data
        const removedKeys = optimizationKeys.splice(0, optimizationKeys.length - 20);
        removedKeys.forEach(key => localStorage.removeItem(key));
      }
      localStorage.setItem('optimizationKeys', JSON.stringify(optimizationKeys));

      // Set a flag to auto-run backtest when the page loads
      localStorage.setItem('auto_run_backtest', 'true');

      // Navigate to backtest page
      window.location.href = '/dashboard/backtest';
    } catch (error) {
      console.error('Error saving optimization for backtest:', error);
      alert('Failed to save optimization. Please try again.');
    }
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
                Strategy Optimization
              </GradientText>
            </h1>
            <p className="text-zinc-400 mt-1">Fine-tune your trading strategies with advanced optimization tools</p>
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
                  <div className="flex justify-center items-center space-x-2">
                    <div className="flex space-x-2">
                      <span className="text-xs text-zinc-500">{pineScript.split('\n').length} lines</span>
                    </div>
                    <button
                      className="p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-xs text-zinc-300 transition-colors"
                      onClick={clearCode}
                      title="Clear code"
                    >
                      clear
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
                        onClick={handleConvert}
                        disabled={isConverting || !pineScript.trim()}
                        className={`${isConverting || !pineScript.trim()
                          ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 hover:bg-gradient-to-r hover:from-purple-600 hover:via-violet-600 hover:to-blue-600 hover:to-[#0060df] text-white'
                          } text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-900/30 flex items-center`}
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
          <div className="space-y-6">
            {/* Test Configuration Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-800/70 p-6 rounded-xl shadow-xl border border-zinc-700/50">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Server className="w-5 h-5 mr-2 text-indigo-500" />
                  Test Configuration
                </h2>
                {/* Symbol selection */}
                <div className="space-y-4 mb-6">
                  <TradeSymbolSelector
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    required={true}
                    className="mb-4"
                  />

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Timeframe</label>
                    <Select
                      value={timeframe}
                      onValueChange={(value) => setTimeframe(value)}
                    >
                      <SelectTrigger
                        className="px-4 py-3 h-auto bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                      >
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border border-zinc-700 text-white">
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
                </div>

                {/* Time Duration */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Time Duration</label>
                    <Select
                      value={timeDuration}
                      onValueChange={(value) => setTimeDuration(value)}
                    >
                      <SelectTrigger
                        className="px-4 py-3 h-auto bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                      >
                        <SelectValue placeholder="Select time duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border border-zinc-700 text-white">
                        <SelectItem value="1W" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">1 week</SelectItem>
                        <SelectItem value="1m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">1 month</SelectItem>
                        <SelectItem value="3m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">3 months</SelectItem>
                        <SelectItem value="6m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">6 months</SelectItem>
                        <SelectItem value="12m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">12 months</SelectItem>
                        <SelectItem value="24m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">24 months</SelectItem>
                        <SelectItem value="36m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">36 months</SelectItem>
                        <SelectItem value="48m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">48 months</SelectItem>
                        <SelectItem value="60m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">60 months</SelectItem>
                        <SelectItem value="120m" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">120 months</SelectItem>
                      </SelectContent>
                    </Select>
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

              {/* Input Condition Panel - Full Width */}
              {jsonData && Object.keys(jsonData?.inputs || {}).length > 0 ? (
                <div className="bg-zinc-800/70 p-6 rounded-xl shadow-xl border border-zinc-700/50">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-indigo-500" />
                    Input Conditions ({Object.keys(jsonData.inputs).length})
                  </h2>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {Object.entries(jsonData.inputs).map(([key, input]) => {
                      // Skip boolean and string inputs with options as they don't need min/max
                      const isRangeType = ['integer', 'float', 'simple'].includes(input.type);

                      // Ensure defaultValue is properly handled for numeric types
                      const defaultValue = isRangeType
                        ? (input.type === 'float'
                          ? parseFloat(input.defaultValue || '0')
                          : parseInt(input.defaultValue || '0', 10))
                        : input.defaultValue;

                      // Calculate min/max values safely
                      const minVal = input.minval ? parseFloat(input.minval) :
                        (input.type === 'float' ? parseFloat(defaultValue || 0) / 2 : parseInt(defaultValue || 0, 10) / 2);

                      const maxVal = input.maxval ? parseFloat(input.maxval) :
                        (input.type === 'float' ? parseFloat(defaultValue || 0) * 2 : parseInt(defaultValue || 0, 10) * 2);

                      return (
                        <div key={key} className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-800">
                          <div className="flex items-center justify-between">
                            <h3 className="text-md font-medium text-white">
                              {input.title || key}
                              <span className="ml-2 text-xs bg-zinc-700/70 px-1.5 py-0.5 rounded-full text-zinc-300">
                                {input.type}
                              </span>
                            </h3>
                          </div>

                          {input.tooltip && (
                            <p className="text-xs text-zinc-400 mt-1 mb-3">
                              <Info className="w-3 h-3 inline mr-1" />
                              {input.tooltip}
                            </p>
                          )}

                          {input.type === 'boolean' ? (
                            <div className="mt-3">
                              <label className="inline-flex items-center text-zinc-300">
                                <input
                                  type="checkbox"
                                  className="form-checkbox rounded bg-zinc-800 border-zinc-700 text-indigo-500 mr-2"
                                  defaultChecked={input.defaultValue === 'true'}
                                />
                                Use in optimization
                              </label>
                            </div>
                          ) : input.type === 'string' && input.options && input.options.length > 0 ? (
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-zinc-400 mb-2">Optimization Values</label>
                              <div className="flex flex-wrap gap-2">
                                {input.options.map((option, index) => (
                                  <label key={index} className="inline-flex items-center text-zinc-300">
                                    <input
                                      type="checkbox"
                                      className="form-checkbox rounded bg-zinc-800 border-zinc-700 text-indigo-500 mr-1"
                                      defaultChecked={option === input.defaultValue}
                                    />
                                    <span className="text-sm">{option.replace(/['"]/g, '')}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ) : isRangeType ? (
                            <div className="mt-3 space-y-3">
                              <div className="grid grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-zinc-400 mb-1">Min Value</label>
                                  <input
                                    type="number"
                                    step={input.type === 'float' ? '0.1' : '1'}
                                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                                    defaultValue={minVal}
                                    data-param={`${key}-min`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-zinc-400 mb-1">Default</label>
                                  <input
                                    type="number"
                                    step={input.type === 'float' ? '0.1' : '1'}
                                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                                    defaultValue={defaultValue || 0}
                                    data-param={`${key}-default`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-zinc-400 mb-1">Max Value</label>
                                  <input
                                    type="number"
                                    step={input.type === 'float' ? '0.1' : '1'}
                                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                                    defaultValue={maxVal}
                                    data-param={`${key}-max`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-zinc-400 mb-1">Step Size</label>
                                  <input
                                    type="number"
                                    step={input.type === 'float' ? '0.1' : '1'}
                                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                                    defaultValue={input.type === 'float' ? '0.1' : '1'}
                                    data-param={`${key}-step`}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : input.type === 'color' ? (
                            <div className="mt-3">
                              <p className="text-sm text-zinc-400">Color parameters are not included in optimization</p>
                            </div>
                          ) : (
                            <div className="mt-3">
                              <p className="text-sm text-zinc-400">This parameter type is not supported for optimization</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-700/30">
                    <div className="bg-amber-900/20 border border-amber-900/40 rounded-lg p-3 flex text-amber-400">
                      <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <div className="text-xs">
                        <p>Setting wide parameter ranges will significantly increase the optimization time. Consider narrowing ranges for faster results.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Fallback when no input parameters are detected
                <div className="bg-zinc-800/70 p-6 rounded-xl shadow-xl border border-zinc-700/50">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-indigo-500" />
                    Input Conditions
                  </h2>

                  <div className="bg-zinc-900/60 p-6 rounded-lg border border-zinc-800 text-center">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                    <p className="text-zinc-300 mb-2">No input parameters detected in your strategy code</p>
                    <p className="text-zinc-500 text-sm">
                      Your Pine Script should contain input variables like:
                      <code className="block mt-2 text-xs bg-zinc-800 p-2 rounded text-green-400 text-left mx-auto max-w-md">
                        length = input.int(14, title="SMA Length")<br />
                        threshold = input.float(1.5, title="Threshold")
                      </code>
                    </p>
                    <button
                      onClick={() => setActiveTab('input')}
                      className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                    >
                      Return to Strategy Input
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="w-full bg-zinc-800/70 p-6 rounded-xl shadow-xl border border-zinc-700/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-indigo-500" />
                Optimization Settings
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Optimization Algorithm</label>
                  <Select defaultValue="brute-force">
                    <SelectTrigger
                      className="px-4 py-3 h-auto bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                    >
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border border-zinc-700 text-white">
                      <SelectItem value="brute-force" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Brute Force</SelectItem>
                      <SelectItem value="genetic" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Genetic Algorithm</SelectItem>
                      <SelectItem value="grid" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Grid Search</SelectItem>
                      <SelectItem value="random" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Random Search</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-zinc-500 mt-1">Brute force tests all combinations for maximum accuracy but can take longer.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Optimization Target</label>
                  <Select defaultValue="return">
                    <SelectTrigger
                      className="px-4 py-3 h-auto bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                    >
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border border-zinc-700 text-white">
                      <SelectItem value="return" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Net Return (%)</SelectItem>
                      <SelectItem value="sharpe" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Sharpe Ratio</SelectItem>
                      <SelectItem value="sortino" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Sortino Ratio</SelectItem>
                      <SelectItem value="profit-factor" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Profit Factor</SelectItem>
                      <SelectItem value="max-drawdown" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Minimize Max Drawdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-amber-900/20 border border-amber-900/40 rounded-lg p-3 flex text-amber-400">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <div className="text-sm">
                    <p>Optimization may take a long time depending on the number of parameters and combinations.</p>
                    <p className="mt-1 text-xs">Be careful of overfitting - optimal parameters on historical data may not perform well on future data.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 flex gap-2">
                <OptimizationButtons
                  onNonExhaustiveClick={() => handleOptimize()}
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Tab Content */}
        {activeTab === 'results' && (
          <div>
            {/* Display error message if any */}
            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 text-red-200">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Error</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              // Loading state UI
              <div className="bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50 p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-200 border-opacity-20 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent animate-spin rounded-full absolute top-0 left-0"></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Optimization In Progress
                    </h3>
                    <p className="text-zinc-400 mb-6">Testing parameter combinations to find the optimal strategy</p>
                    <div className="bg-zinc-700/50 h-3 rounded-full max-w-md mx-auto overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-[60000ms] ease-linear w-0"
                        style={{
                          animationName: 'progressAnimation',
                          animationDuration: '60s',
                          animationTimingFunction: 'linear',
                          animationFillMode: 'forwards'
                        }}
                      ></div>
                    </div>
                    <style jsx global>{`
                      @keyframes progressAnimation {
                        0% { width: 0%; }
                        100% { width: 100%; }
                      }
                    `}</style>
                    <div className="mt-3 text-zinc-300 font-medium">
                      Running optimization...
                    </div>
                    <div className="mt-2 text-zinc-500">
                      This will take approximately 60 seconds
                    </div>
                  </div>
                </div>
              </div>
            ) : showResults && results ? (
              // Results display UI
              <div className="space-y-6">
                {/* Performance Summary Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {/* Total Return Card */}
                  <div className="bg-zinc-900/70 rounded-xl p-4 border border-zinc-800/80">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-zinc-400 text-xs mb-1">TOTAL RETURN</span>
                        <span className={`text-2xl font-semibold ${results?.bestResult?.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {results?.bestResult?.return >= 1000 ?
                            `+${(results?.bestResult?.return).toLocaleString()}%` :
                            `+${results?.bestResult?.return}%`}
                        </span>
                      </div>
                      <div className={`p-2 rounded-full ${results?.bestResult?.return >= 0 ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                        <TrendingUp className={`w-5 h-5 ${results?.bestResult?.return >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                      </div>
                    </div>
                  </div>

                  {/* Max Drawdown Card */}
                  <div className="bg-zinc-900/70 rounded-xl p-4 border border-zinc-800/80">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-zinc-400 text-xs mb-1">MAX DRAWDOWN</span>
                        <span className="text-2xl font-semibold text-red-500">
                          {results?.bestResult?.maxDrawdown}%
                        </span>
                      </div>
                      <div className="p-2 rounded-full bg-red-900/20">
                        <TrendingUp className="w-5 h-5 text-red-500 transform rotate-180" />
                      </div>
                    </div>
                  </div>

                  {/* Profit Factor Card */}
                  <div className="bg-zinc-900/70 rounded-xl p-4 border border-zinc-800/80">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-zinc-400 text-xs mb-1">PROFIT FACTOR</span>
                        <span className="text-2xl font-semibold text-blue-500">
                          {results?.bestResult?.profitFactor}
                        </span>
                      </div>
                      <div className="p-2 rounded-full bg-blue-900/20">
                        <BarChart2 className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Win Rate Card */}
                  <div className="bg-zinc-900/70 rounded-xl p-4 border border-zinc-800/80">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-zinc-400 text-xs mb-1">WIN RATE</span>
                        <span className="text-2xl font-semibold text-indigo-500">
                          {results?.bestResult?.winRate}%
                        </span>
                      </div>
                      <div className="p-2 rounded-full bg-indigo-900/20">
                        <Zap className="w-5 h-5 text-indigo-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Best Parameters Card */}
                  <div className="bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50">
                    <div className="p-4 bg-indigo-900/30 border-b border-indigo-800/30 flex items-center justify-between">
                      <div className="flex items-center">
                        <Zap className="w-5 h-5 text-indigo-400 mr-2" />
                        <h2 className="text-white font-medium">Optimized Parameters</h2>
                      </div>
                      {optimizationId && (
                        <div className="text-xs text-zinc-400">
                          ID: {optimizationId.substring(0, 8)}...
                        </div>
                      )}
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

                      {/* Add button to apply optimized parameters and go to backtest */}
                      {results && results.optimizedParameters && (
                        <div className="mt-6">

                        </div>
                      )}
                    </div>
                  </div>

                  {/* Performance Charts */}
                  <div className="lg:col-span-2 bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50">
                    <div className="p-4 bg-zinc-900/70 border-b border-zinc-700/50 flex items-center justify-between">
                      <div className="flex items-center">
                        <BarChart2 className="w-5 h-5 text-indigo-500 mr-2" />
                        <h2 className="text-white font-medium">Optimization Analysis</h2>
                      </div>
                      <div className="text-xs text-zinc-400">
                        {results?.testedCombinations} combinations tested
                      </div>
                    </div>
                    <div className="p-6">
                      {/* Chart component for visualization */}
                      <div className="bg-zinc-900/70 rounded-lg h-64">
                        {results ? (
                          <OptimizationChart
                            parameterSets={results.parameterSets}
                            optimizedParameters={results.optimizedParameters}
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-center">
                            <div className="text-zinc-500">
                              <BarChart2 className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
                              <p className="text-zinc-400">Parameter Optimization Chart</p>
                              <p className="text-zinc-600 text-xs mt-1">Performance visualization would appear here</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Return Distribution Chart */}
                      {results && results.parameterSets && results.parameterSets.length > 0 && (
                        <div className="mt-6 bg-zinc-900/70 rounded-lg h-64">
                          <ReturnDistributionChart parameterSets={results.parameterSets} />
                        </div>
                      )}

                      {/* Parameter correlation section */}
                      {results && results.heatMapData && results.heatMapData.length > 0 && (
                        <ParameterHeatmap
                          heatMapData={results.heatMapData}
                          parameterRanges={results.parameterRanges}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Parameter Results Table */}
                <div className="bg-zinc-800/70 rounded-xl shadow-xl overflow-hidden border border-zinc-700/50">
                  <div className="p-4 bg-zinc-900/70 border-b border-zinc-700/50 flex items-center justify-between">
                    <div className="flex items-center">
                      <Server className="w-5 h-5 text-indigo-500 mr-2" />
                      <h2 className="text-white font-medium">Best Parameter Combination</h2>
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
                          {results && results.optimizedParameters && Object.keys(results.optimizedParameters).map(param => (
                            <th key={param} className="py-3 px-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">{param}</th>
                          ))}
                          <th className="py-3 px-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Return %</th>
                          <th className="py-3 px-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Win Rate</th>
                          <th className="py-3 px-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Profit Factor</th>
                          <th className="py-3 px-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Max DD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results && results.parameterSets && results.parameterSets.length > 0 && (
                          <tr className="bg-indigo-900/20 hover:bg-indigo-900/30 transition-colors">
                            {Object.keys(results.optimizedParameters).map(param => (
                              <td key={param} className="py-4 px-4 whitespace-nowrap text-sm font-medium text-white">{results.parameterSets[0][param]}</td>
                            ))}
                            <td className="py-4 px-4 whitespace-nowrap text-sm text-right font-medium text-green-400">
                              {results.parameterSets[0].return >= 1000 ?
                                `+${(results.parameterSets[0].return).toLocaleString()}%` :
                                `+${results.parameterSets[0].return}%`}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-sm text-right font-medium text-white">{results.parameterSets[0].winRate}%</td>
                            <td className="py-4 px-4 whitespace-nowrap text-sm text-right font-medium text-white">{results.parameterSets[0].profitFactor}</td>
                            <td className="py-4 px-4 whitespace-nowrap text-sm text-right font-medium text-red-400">{results.parameterSets[0].maxDrawdown}%</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              // No results placeholder
              <div className="bg-zinc-800/70 rounded-xl p-10 shadow-xl text-center border border-zinc-700/50">
                <Clock className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-white text-xl font-medium mb-2">No Optimization Results Yet</h3>
                <p className="text-zinc-400 mb-6">Configure and run an optimization to see your strategy performance</p>
                <button
                  onClick={() => setActiveTab('configure')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-900/30 hover:bg-gradient-to-r hover:from-purple-600 hover:via-violet-600 hover:to-blue-600 hover:to-[#0060df]"
                >
                  Go to Configuration
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}