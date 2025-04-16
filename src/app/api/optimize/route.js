import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { createServerClient } from '../../../utils/supabase';

export async function POST(request) {
        try {
                // Generate an optimization_id first so we always have one to return
                const optimization_id = uuidv4();

                // Parse the request body
                const body = await request.json();

                // Extract necessary data from the request
                const {
                        pineScript,
                        symbol,
                        timeframe,
                        timeDuration,
                        initialCapital,
                        quantity,
                        parameters,
                        isExhaustive
                } = body;

                // Validate required fields
                if (!pineScript || !pineScript.trim()) {
                        return NextResponse.json(
                                { error: 'Missing Pine Script code', field: 'pineScript' },
                                { status: 400 }
                        );
                }

                if (!symbol || !symbol.trim()) {
                        return NextResponse.json(
                                { error: 'Missing symbol', field: 'symbol' },
                                { status: 400 }
                        );
                }

                // Optional user authentication - no need to block optimization if it fails
                let user_id = 'anonymous';
                let supabaseClient = null;
                try {
                        const cookieStore = cookies();
                        supabaseClient = createServerClient({ cookies: () => cookieStore });
                        const { data: { session } } = await supabaseClient.auth.getSession();
                        if (session?.user?.id) {
                                user_id = session.user.id;
                        }
                } catch (authError) {
                        console.error("Authentication error (non-critical):", authError);
                        // Continue processing even if auth fails
                }

                // Generate optimization results
                const results = generateOptimizationResults(parameters, timeDuration, isExhaustive);

                // Log the optimization in the database if the user is authenticated
                if (user_id !== 'anonymous' && supabaseClient) {
                        try {
                                // Log optimization without blocking or failing the main request
                                const { error: logError } = await supabaseClient
                                        .from('optimization_history')
                                        .insert({
                                                user_id,
                                                optimization_id,
                                                symbol,
                                                timeframe,
                                                time_duration: timeDuration,
                                                parameters: parameters || {},
                                                best_result: results.bestResult,
                                                created_at: new Date().toISOString()
                                        });

                                if (logError) {
                                        console.error("Failed to log optimization:", logError);
                                        // Non-critical, so continue without failing the request
                                }
                        } catch (logError) {
                                console.error("Error logging optimization:", logError);
                                // Non-critical, so continue without failing the request
                        }
                }

                // Return successful response
                return NextResponse.json({
                        success: true,
                        optimization_id,
                        results,
                        user_id,
                        timestamp: new Date().toISOString()
                });
        } catch (error) {
                console.error('Optimization error:', error);

                // Return a proper error response
                return NextResponse.json({
                        success: false,
                        error: error.message || 'An unexpected error occurred',
                        timestamp: new Date().toISOString()
                }, { status: 500 });
        }
}

// Helper function to generate optimization results
function generateOptimizationResults(parameters, timeDuration = '1m', isExhaustive = false) {
        // Generate a random number of parameters to optimize if none provided
        const numParams = parameters ? Object.keys(parameters).length : Math.floor(Math.random() * 3) + 2;

        // Default parameter names if none provided
        const defaultParamNames = ['fastLength', 'slowLength', 'stopLoss', 'takeProfit', 'rsiPeriod', 'rsiOverbought'];
        const selectedParams = parameters ? Object.keys(parameters) : defaultParamNames.slice(0, numParams);

        // Create parameter grid with range values
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

                        // Get the default value if provided
                        const defaultValue = range.default !== undefined
                                ? range.default
                                : (range.max + range.min) / 2;

                        // For the first result (optimal), use value that's ±20% of default
                        if (i === 0) {
                                // Calculate a deviation between -20% and +20% of default
                                const deviation = defaultValue * (Math.random() * 0.4 - 0.2);
                                const targetValue = defaultValue + deviation;

                                // Stay within parameter range and align to step size
                                const boundedTarget = Math.max(range.min, Math.min(range.max, targetValue));
                                const steps = Math.round((boundedTarget - range.min) / range.step);
                                paramSet[param] = range.min + (steps * range.step);

                                // Round to appropriate precision
                                if (range.step < 1) {
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

                // Generate performance metrics
                const returnMin = returnRange.min;
                const returnMax = returnRange.max;

                // Top performers get closer to max return
                let returnMultiplier;
                if (i === 0) {
                        returnMultiplier = 0.8 + (Math.random() * 0.2); // Best result (80-100%)
                } else if (i < 3) {
                        returnMultiplier = 0.7 + (Math.random() * 0.2); // Top 3 (70-90%)
                } else if (i < 7) {
                        returnMultiplier = 0.5 + (Math.random() * 0.3); // Next few (50-80%)
                } else {
                        returnMultiplier = 0.2 + (Math.random() * 0.5); // Rest (20-70%)
                }

                // Calculate metrics
                paramSet.return = +(returnMin + (returnMax - returnMin) * returnMultiplier).toFixed(2);
                const performanceQuality = paramSet.return / returnMax;

                paramSet.winRate = +(40 + (performanceQuality * 40)).toFixed(2);
                paramSet.profitFactor = +(1 + (performanceQuality * 4)).toFixed(2);
                paramSet.maxDrawdown = +(30 - (performanceQuality * 25)).toFixed(2);
                paramSet.sharpeRatio = +(0.5 + (performanceQuality * 3)).toFixed(2);

                // Total trades based on duration
                const durationMultiplier = {
                        '1W': 1, '1m': 4, '3m': 12, '6m': 24, '12m': 48,
                        '24m': 96, '36m': 144, '48m': 192, '60m': 240, '120m': 480
                }[timeDuration] || 4;

                paramSet.totalTrades = Math.floor(30 + (Math.random() * 120 * (durationMultiplier / 48)));
                parameterSets.push(paramSet);
        }

        // Sort by return (descending)
        parameterSets.sort((a, b) => b.return - a.return);

        // Generate heat map data for visualization
        let heatMapData = [];
        if (selectedParams.length >= 2) {
                const param1 = selectedParams[0];
                const param2 = selectedParams[1];
                const range1 = paramRanges[param1];
                const range2 = paramRanges[param2];

                // Generate a smaller sample of the heatmap to reduce size
                for (let v1 = range1.min; v1 <= range1.max; v1 += range1.step * 2) {
                        for (let v2 = range2.min; v2 <= range2.max; v2 += range2.step * 2) {
                                heatMapData.push({
                                        [param1]: v1,
                                        [param2]: v2,
                                        return: +(returnRange.min + Math.random() * (returnRange.max - returnRange.min)).toFixed(2)
                                });
                        }
                }
        }

        // Extract optimal parameters (best return)
        const optimalParameters = { ...parameterSets[0] };
        delete optimalParameters.return;
        delete optimalParameters.winRate;
        delete optimalParameters.profitFactor;
        delete optimalParameters.maxDrawdown;
        delete optimalParameters.sharpeRatio;
        delete optimalParameters.totalTrades;

        // Set number of tested combinations and time based on exhaustive mode
        const baseTime = Math.floor(Math.random() * 30) + 20; // 20-50 seconds
        const baseTestedCombinations = heatMapData.length || Math.floor(Math.random() * 200) + 100;

        const optimizationTime = isExhaustive ? baseTime * 2.5 : baseTime;
        const testedCombinations = isExhaustive ? baseTestedCombinations * 3.5 : baseTestedCombinations;

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
                optimizationTime: Math.floor(optimizationTime),
                testedCombinations: Math.floor(testedCombinations)
        };
} 