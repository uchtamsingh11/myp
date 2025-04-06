import { NextResponse } from 'next/server';
import { createServerClient } from '../../../utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

export async function POST(request) {
        try {
                // Get the request body
                const body = await request.json();

                // Extract necessary data from the request
                const { pineScript, symbol, timeframe, timeDuration, initialCapital, quantity, parameters, isExhaustive } = body;

                if (!pineScript || !symbol) {
                        return NextResponse.json(
                                { error: 'Missing required fields: pineScript and symbol are required' },
                                { status: 400 }
                        );
                }

                // Get user authentication info
                const cookieStore = cookies();
                const supabaseAuthClient = createServerClient({ cookies: () => cookieStore });
                const { data: { session } } = await supabaseAuthClient.auth.getSession();
                const user_id = session?.user?.id || 'anonymous';

                // Create Supabase client
                const supabase = createServerClient();

                // SIMPLIFIED APPROACH: First check if we already have results for this exact script and parameters
                const { data: existingOptimizations } = await supabase
                        .from('optimizations')
                        .select('id, results, parameters')
                        .eq('script', pineScript)
                        .eq('symbol', symbol)
                        .eq('timeframe', timeframe || '')
                        .eq('user_id', user_id)
                        .order('created_at', { ascending: false })
                        .limit(5);

                // Check if any of the existing optimizations have the same parameters
                if (existingOptimizations && existingOptimizations.length > 0) {
                        for (const existing of existingOptimizations) {
                                // Compare parameters to see if they match
                                const existingParams = existing.parameters || {};
                                const currentParams = parameters || {};

                                // Quick check - if different number of parameters, they don't match
                                if (Object.keys(existingParams).length === Object.keys(currentParams).length) {
                                        let paramsMatch = true;

                                        // Check each parameter value
                                        for (const key in currentParams) {
                                                if (JSON.stringify(existingParams[key]) !== JSON.stringify(currentParams[key])) {
                                                        paramsMatch = false;
                                                        break;
                                                }
                                        }

                                        // If all parameters match, return these cached results
                                        if (paramsMatch) {
                                                console.log('Using cached optimization results');
                                                return NextResponse.json({
                                                        optimization_id: existing.id,
                                                        results: existing.results,
                                                        cached: true
                                                });
                                        }
                                }
                        }
                }

                // If we got here, we need to generate new results

                // Generate an optimization_id
                const optimization_id = uuidv4();

                // Simulate optimization process by generating pseudo-results
                const results = generateOptimizationResults(parameters, timeDuration);

                // For exhaustive mode, add more combinations and longer processing time
                if (isExhaustive) {
                        results.testedCombinations = Math.floor(results.testedCombinations * 3.5);
                        results.optimizationTime = Math.floor(results.optimizationTime * 2.8);
                }

                // Store the optimization in the database
                const { error } = await supabase
                        .from('optimizations')
                        .insert({
                                id: optimization_id,
                                user_id: user_id,
                                symbol: symbol,
                                timeframe: timeframe || '',
                                time_duration: timeDuration || null,
                                script: pineScript,
                                initial_capital: initialCapital || null,
                                quantity: quantity || null,
                                parameters: parameters || {},
                                results: results
                        });

                if (error) {
                        console.error('Database error:', error);
                        return NextResponse.json(
                                { error: 'Failed to save optimization results', details: error.message },
                                { status: 500 }
                        );
                }

                // Return the optimization results
                return NextResponse.json({
                        optimization_id,
                        results,
                        cached: false
                });
        } catch (error) {
                console.error('Optimization error:', error);
                return NextResponse.json(
                        { error: 'An unexpected error occurred', details: error.message },
                        { status: 500 }
                );
        }
}

// Helper function to generate pseudo-optimization results
function generateOptimizationResults(parameters, timeDuration = '1m') {
        // Generate a random number of parameters to optimize if none provided
        const numParams = parameters ? Object.keys(parameters).length : Math.floor(Math.random() * 3) + 2;

        // Default parameter names if none provided
        const defaultParamNames = ['fastLength', 'slowLength', 'stopLoss', 'takeProfit', 'rsiPeriod', 'rsiOverbought'];
        const selectedParams = parameters ? Object.keys(parameters) : defaultParamNames.slice(0, numParams);

        // Create parameter grid with random range values
        const paramRanges = {};
        selectedParams.forEach(param => {
                if (parameters && parameters[param]) {
                        paramRanges[param] = parameters[param];
                } else {
                        if (param.includes('Length') || param.includes('Period')) {
                                paramRanges[param] = { min: 5, max: 50, step: 5 };
                        } else if (param.includes('Loss') || param.includes('Profit')) {
                                paramRanges[param] = { min: 1.0, max: 5.0, step: 0.5 };
                        } else if (param.includes('Overbought')) {
                                paramRanges[param] = { min: 65, max: 85, step: 5 };
                        } else {
                                paramRanges[param] = { min: 1, max: 10, step: 1 };
                        }
                }
        });

        // Define return ranges based on time duration
        const returnRanges = {
                '1W': { min: 22, max: 79.62 },
                '1m': { min: 57, max: 332 },
                '3m': { min: 189, max: 584.68 },
                '6m': { min: 442, max: 983 },
                '12m': { min: 867, max: 1455 },
                '24m': { min: 1455, max: 3299 },
                '36m': { min: 1580, max: 9500 },
                '48m': { min: 3000, max: 22000 },
                '60m': { min: 5000, max: 35000 },
                '120m': { min: 12000, max: 56700 }
        };

        // Default to 1 month if the provided duration isn't in our mapping
        const returnRange = returnRanges[timeDuration] || returnRanges['1m'];

        // Generate random parameter sets with results
        const parameterSets = [];
        for (let i = 0; i < 20; i++) {
                const paramSet = {};

                // Generate random parameter values
                selectedParams.forEach(param => {
                        const range = paramRanges[param];

                        // Get the actual default value if provided in the range object
                        // Many range objects from the frontend will include a 'default' property with user-set value
                        const defaultValue = range.default !== undefined
                                ? range.default
                                : (range.max + range.min) / 2; // Fallback to midpoint if no default provided

                        // For the first result (optimal), use value that's ±20% of default
                        if (i === 0) {
                                // Calculate a deviation between -20% and +20% of default
                                const deviation = defaultValue * (Math.random() * 0.4 - 0.2);

                                // Calculate the target value with deviation (±20% of default)
                                const targetValue = defaultValue + deviation;

                                // Debug logging to verify calculations
                                console.log(`Parameter: ${param}, Default: ${defaultValue}, Target: ${targetValue} (±20% range: ${defaultValue * 0.8} to ${defaultValue * 1.2})`);

                                // Make sure the value stays within range and is aligned with step size
                                // First ensure we're within the parameter's min/max range
                                const boundedTarget = Math.max(range.min, Math.min(range.max, targetValue));

                                // Then align to the nearest step
                                const steps = Math.round((boundedTarget - range.min) / range.step);
                                paramSet[param] = range.min + (steps * range.step);

                                // Additional check to ensure we're truly within ±20% of default
                                // If not, force it to be within range while respecting step size
                                if (paramSet[param] > defaultValue * 1.2) {
                                        const maxAllowedValue = defaultValue * 1.2;
                                        const maxAllowedSteps = Math.floor((maxAllowedValue - range.min) / range.step);
                                        paramSet[param] = range.min + (maxAllowedSteps * range.step);
                                } else if (paramSet[param] < defaultValue * 0.8) {
                                        const minAllowedValue = defaultValue * 0.8;
                                        const minAllowedSteps = Math.ceil((minAllowedValue - range.min) / range.step);
                                        paramSet[param] = range.min + (minAllowedSteps * range.step);
                                }

                                // Final boundary check
                                if (paramSet[param] < range.min) paramSet[param] = range.min;
                                if (paramSet[param] > range.max) paramSet[param] = range.max;

                                // Round to appropriate precision based on step size
                                if (range.step < 1) {
                                        // Count decimal places in step size
                                        const decimalPlaces = range.step.toString().split('.')[1]?.length || 0;
                                        paramSet[param] = +paramSet[param].toFixed(decimalPlaces);
                                }
                        } else {
                                // For other results, use wider randomization
                                const steps = Math.floor((range.max - range.min) / range.step);
                                const randomStep = Math.floor(Math.random() * (steps + 1));
                                paramSet[param] = range.min + (randomStep * range.step);

                                // Round to appropriate precision
                                if (range.step < 1) {
                                        const decimalPlaces = range.step.toString().split('.')[1]?.length || 0;
                                        paramSet[param] = +paramSet[param].toFixed(decimalPlaces);
                                }
                        }
                });

                // Generate random performance metrics based on time duration
                // Calculate return based on the specified ranges
                const returnMin = returnRange.min;
                const returnMax = returnRange.max;

                // Top performers get closer to max return, others are more distributed
                let returnMultiplier;
                if (i === 0) {
                        // Best result gets 80-100% of max return
                        returnMultiplier = 0.8 + (Math.random() * 0.2);
                } else if (i < 3) {
                        // Top 3 results get 70-90% of max return
                        returnMultiplier = 0.7 + (Math.random() * 0.2);
                } else if (i < 7) {
                        // Next few get 50-80% of max return
                        returnMultiplier = 0.5 + (Math.random() * 0.3);
                } else {
                        // Rest get 20-70% of max return
                        returnMultiplier = 0.2 + (Math.random() * 0.5);
                }

                // Calculate the return value
                paramSet.return = +(returnMin + (returnMax - returnMin) * returnMultiplier).toFixed(2);

                // Scale other metrics based on the return
                const performanceQuality = paramSet.return / returnMax; // 0 to 1 scale of how good the return is

                // Win rate increases with return (40-80%)
                paramSet.winRate = +(40 + (performanceQuality * 40)).toFixed(2);

                // Profit factor (1-5)
                paramSet.profitFactor = +(1 + (performanceQuality * 4)).toFixed(2);

                // Max drawdown (inversely related to performance, 5-30%)
                paramSet.maxDrawdown = +(30 - (performanceQuality * 25)).toFixed(2);

                // Sharpe ratio (0.5-3.5)
                paramSet.sharpeRatio = +(0.5 + (performanceQuality * 3)).toFixed(2);

                // Total trades (more trades for longer durations)
                const durationMultiplier = {
                        '1W': 1,
                        '1m': 4,
                        '3m': 12,
                        '6m': 24,
                        '12m': 48,
                        '24m': 96,
                        '36m': 144,
                        '48m': 192,
                        '60m': 240,
                        '120m': 480
                }[timeDuration] || 4;

                paramSet.totalTrades = Math.floor(30 + (Math.random() * 120 * (durationMultiplier / 48)));

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
                                        return: +(returnRange.min + Math.random() * (returnRange.max - returnRange.min)).toFixed(2)
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
                optimizationTime: Math.floor(Math.random() * 60) + 30, // 30-90 seconds
                testedCombinations: heatMapData.length || Math.floor(Math.random() * 300) + 100
        };
} 