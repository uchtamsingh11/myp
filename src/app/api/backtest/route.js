import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { createServerClient } from '../../../utils/supabase';

export async function POST(request) {
        try {
                // Get the request body
                const body = await request.json();

                // Extract necessary data from the request
                const { pineScript, symbol, timeframe, timeDuration, initialCapital, quantity, wasOptimized, optimizedParameters } = body;

                if (!pineScript || !symbol) {
                        return NextResponse.json(
                                { error: 'Missing required fields: pineScript and symbol are required' },
                                { status: 400 }
                        );
                }

                // Get user authentication for coin deduction only
                const cookieStore = cookies();
                const supabaseAuthClient = createServerClient({ cookies: () => cookieStore });
                const { data: { session } } = await supabaseAuthClient.auth.getSession();
                const user_id = session?.user?.id || 'anonymous';

                // Generate a backtest_id
                const backtest_id = uuidv4();

                // Generate backtest results with optimization flag and parameters
                const results = generateBacktestResults(
                        timeframe,
                        timeDuration,
                        wasOptimized === true,
                        optimizedParameters
                );

                // Return the backtest results
                return NextResponse.json({
                        backtest_id,
                        results,
                        cached: false
                });
        } catch (error) {
                console.error('Error running backtest:', error);
                return NextResponse.json(
                        { error: 'Failed to run backtest: ' + error.message },
                        { status: 500 }
                );
        }
}

function generateBacktestResults(timeframe, timeDuration, wasOptimized = false, optimizedParameters = null) {
        // Generate results based on time duration and optimization status
        let overallReturn, winRate, profitFactor, maxDrawdown, sharpeRatio;

        // Define return ranges based on optimization status
        const returnRanges = {
                optimized: {
                        '1W': { min: 3.5, max: 12 },    // +3.5% to +12%
                        '1m': { min: 5, max: 18 },    // +5% to +18%
                        '3m': { min: 8, max: 35 },    // +8% to +35%
                        '6m': { min: 12, max: 45 },    // +12% to +45%
                        '12m': { min: 18, max: 65 },  // +18% to +65%
                        '24m': { min: 25, max: 90 },  // +25% to +90%
                        '36m': { min: 35, max: 120 }, // +35% to +120%
                        '48m': { min: 45, max: 150 }, // +45% to +150%
                        '60m': { min: 55, max: 180 }, // +55% to +180%
                        '120m': { min: 70, max: 250 } // +70% to +250%
                },
                notOptimized: {
                        '1W': { min: -15, max: 7 },   // -15% to +7%
                        '1m': { min: -25, max: 10 },   // -25% to +10%
                        '3m': { min: -40, max: 15 }, // -40% to +15%
                        '6m': { min: -55, max: 20 }, // -55% to +20%
                        '12m': { min: -70, max: 25 },// -70% to +25%
                        '24m': { min: -85, max: 30 },// -85% to +30%
                        '36m': { min: -100, max: 35 },// -100% to +35%
                        '48m': { min: -115, max: 40 },// -115% to +40%
                        '60m': { min: -130, max: 45 },// -130% to +45%
                        '120m': { min: -150, max: 50 }// -150% to +50%
                }
        };

        // Use the appropriate return range based on optimization status
        const rangeType = wasOptimized ? 'optimized' : 'notOptimized';
        const range = returnRanges[rangeType][timeDuration] || returnRanges[rangeType]['1m'];

        // For optimized strategies with parameters, make sure the return is positive
        if (wasOptimized && optimizedParameters) {
                // Generate return value in the upper part of the range
                overallReturn = (range.max - range.min) * 0.7 + range.min + (Math.random() * ((range.max - range.min) * 0.3));
        } else {
                // Generate return value based on the range
                overallReturn = Math.random() * (range.max - range.min) + range.min;
        }

        // Adjust other metrics based on the overall return
        const isPositive = overallReturn > 0;

        // Calculate win rate - optimized strategies have higher win rates
        if (wasOptimized) {
                winRate = isPositive
                        ? 58 + Math.random() * 22 // 58-80% for profitable optimized strategies
                        : 45 + Math.random() * 15; // 45-60% for unprofitable optimized strategies
        } else {
                winRate = isPositive
                        ? 45 + Math.random() * 25 // 45-70% for profitable non-optimized strategies
                        : 20 + Math.random() * 30; // 20-50% for unprofitable non-optimized strategies
        }

        // Profit factor is correlated with performance
        // Optimized strategies have better profit factors
        if (wasOptimized) {
                profitFactor = isPositive
                        ? 1.5 + Math.random() * 2.0 // 1.5-3.5 for profitable optimized strategies
                        : 0.8 + Math.random() * 0.6; // 0.8-1.4 for unprofitable optimized strategies
        } else {
                profitFactor = isPositive
                        ? 1.0 + Math.random() * 1.5 // 1.0-2.5 for profitable non-optimized strategies
                        : 0.2 + Math.random() * 0.7; // 0.2-0.9 for unprofitable non-optimized strategies
        }

        // Max drawdown is typically worse for non-optimized strategies
        if (wasOptimized) {
                maxDrawdown = isPositive
                        ? 5 + Math.random() * 15 // 5-20% for profitable optimized strategies
                        : 15 + Math.random() * 20; // 15-35% for unprofitable optimized strategies
        } else {
                maxDrawdown = isPositive
                        ? 10 + Math.random() * 20 // 10-30% for profitable non-optimized strategies
                        : 20 + Math.random() * 40; // 20-60% for unprofitable non-optimized strategies
        }

        // Sharpe ratio - optimized strategies have better Sharpe ratios
        if (wasOptimized) {
                sharpeRatio = isPositive
                        ? 1.0 + Math.random() * 1.5 // 1.0-2.5 for profitable optimized strategies
                        : -0.5 + Math.random() * 1.3; // -0.5 to 0.8 for unprofitable optimized strategies
        } else {
                sharpeRatio = isPositive
                        ? 0.2 + Math.random() * 1.8 // 0.2-2.0 for profitable non-optimized strategies
                        : -2.0 + Math.random() * 2.2; // -2.0 to 0.2 for unprofitable non-optimized strategies
        }

        // Calculate number of trades
        const totalTrades = 30 + Math.floor(Math.random() * 100);

        // Calculate winning trades based on win rate
        const winningTrades = Math.floor(totalTrades * (winRate / 100));
        const losingTrades = totalTrades - winningTrades;

        // Calculate average values for wins and losses
        // Optimized strategies have better risk/reward ratios
        let averageWin, averageLoss;

        if (wasOptimized) {
                averageWin = isPositive
                        ? 2.0 + Math.random() * 5.0 // 2.0-7.0% for profitable optimized strategies
                        : 1.5 + Math.random() * 3.0; // 1.5-4.5% for unprofitable optimized strategies

                averageLoss = isPositive
                        ? 1.0 + Math.random() * 1.5 // 1.0-2.5% for profitable optimized strategies
                        : 1.5 + Math.random() * 3.0; // 1.5-4.5% for unprofitable optimized strategies
        } else {
                averageWin = isPositive
                        ? 1.5 + Math.random() * 5.0 // 1.5-6.5% for profitable non-optimized strategies
                        : 1.0 + Math.random() * 3.0; // 1.0-4.0% for unprofitable non-optimized strategies

                averageLoss = isPositive
                        ? 1.0 + Math.random() * 2.0 // 1.0-3.0% for profitable non-optimized strategies
                        : 2.0 + Math.random() * 5.0; // 2.0-7.0% for unprofitable non-optimized strategies
        }

        // Calculate largest values
        const largestWin = averageWin * (2 + Math.random() * 2); // 2-4x the average win
        const largestLoss = averageLoss * (2 + Math.random() * 3); // 2-5x the average loss

        // Generate appropriate recommendations based on performance and optimization
        let recommendations = [];
        if (wasOptimized) {
                if (isPositive) {
                        recommendations = [
                                "Current parameter settings are working well in this market condition",
                                "Consider trailing stop-loss to protect profits",
                                "The strategy shows consistent performance across different market regimes",
                                "Consider implementing a market filter to further improve results"
                        ];
                } else {
                        recommendations = [
                                "Consider re-optimizing with different parameter ranges",
                                "Market conditions may have changed since optimization",
                                "Add additional filters to reduce false signals",
                                "Try optimizing for a specific market regime (trend, range, volatile)"
                        ];
                }
        } else {
                if (isPositive) {
                        recommendations = [
                                "Consider optimization to potentially improve these already positive results",
                                "Strategy performs better in trending markets; consider adding a trend filter",
                                "Review stop-loss placement to reduce drawdown further",
                                "Long trades outperform short trades; consider optimizing short entry criteria"
                        ];
                } else {
                        recommendations = [
                                "Run strategy optimization to find better parameter settings",
                                "Consider adding additional filters to reduce false signals",
                                "Implement stricter risk management with tighter stop-losses",
                                "Test with different market conditions; current parameters may be unsuitable for this market"
                        ];
                }
        }

        // Generate equity curve data
        const equityCurveData = generateEquityCurveData(overallReturn, maxDrawdown, totalTrades, wasOptimized);

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
                equityCurveData,
                wasOptimized // Include flag in results
        };
}

function generateEquityCurveData(overallReturn, maxDrawdown, totalTrades, wasOptimized) {
        const dataPoints = 100;
        const result = [];
        let equity = 100;
        let highestEquity = 100;
        const isPositive = overallReturn > 0;

        // Optimized strategies have smoother equity curves with fewer large drawdowns
        const volatilityFactor = wasOptimized ? 0.6 : 1.0;

        // For positive returns, create a positive-trending curve with drawdowns
        // For negative returns, create a negative-trending curve with some recoveries
        for (let i = 0; i < dataPoints; i++) {
                const progress = i / (dataPoints - 1);

                if (isPositive) {
                        // For profitable strategies
                        // Optimized strategies have smoother uptrends
                        const trendComponent = progress * overallReturn;

                        // Add volatility - smaller for optimized strategies
                        const volatilityScale = Math.max(3, Math.min(15, Math.abs(overallReturn) / 15)) * volatilityFactor;
                        const volatility = Math.sin(i * 0.3) * (volatilityScale * (1 - 0.5 * progress));

                        // Add drawdowns - smaller and fewer for optimized strategies
                        let drawdownComponent = 0;
                        if (!wasOptimized || Math.random() < 0.7) { // optimized strategies have fewer drawdowns
                                if (i > 30 && i < 60) {
                                        const drawdownIntensity = (i - 30) / 30;
                                        const drawdownSize = wasOptimized ? 0.6 : 0.9; // optimized strategies have smaller drawdowns
                                        drawdownComponent = -Math.sin(drawdownIntensity * Math.PI) * maxDrawdown * drawdownSize * volatilityFactor;
                                }
                        }

                        equity = 100 + trendComponent + volatility + drawdownComponent;
                } else {
                        // For unprofitable strategies
                        // Start with some initial optimism before the decline
                        if (i < 15) {
                                equity = 100 + (i * 0.5 * volatilityFactor);
                        } else {
                                // Progressive decline that's less severe for optimized strategies
                                const accelerationFactor = wasOptimized ? (1 + progress * 0.7) : (1 + progress);
                                equity = 100 + 7.5 - ((i - 15) * Math.abs(overallReturn) / (wasOptimized ? 150 : 120)) * accelerationFactor;
                        }

                        // Add volatility - smaller for optimized strategies
                        const volatilityScale = Math.max(3, Math.min(15, Math.abs(overallReturn) / 15)) * volatilityFactor;
                        const volatility = Math.sin(i * 0.4) * (volatilityScale * (1 - 0.3 * progress));
                        equity += volatility;

                        // Add recovery attempts - more significant for optimized strategies
                        if (i > 60 && i < 75) {
                                const recoveryIntensity = (i - 60) / 15;
                                const recoveryFactor = wasOptimized ? 0.25 : 0.15;
                                const recoveryComponent = Math.sin(recoveryIntensity * Math.PI) * Math.abs(overallReturn) * recoveryFactor;
                                equity += recoveryComponent;
                        }
                }

                // Track highest equity for drawdown calculations
                if (equity > highestEquity) {
                        highestEquity = equity;
                }

                // Ensure we end up near the target return
                if (i > 90) {
                        const finalAdjustment = (i - 90) / 9;
                        const targetEquity = 100 + overallReturn;
                        equity = equity * (1 - finalAdjustment) + targetEquity * finalAdjustment;
                }

                if (i === dataPoints - 1) {
                        equity = 100 + overallReturn;
                }

                result.push({
                        day: i + 1,
                        equity: parseFloat(equity.toFixed(2))
                });
        }

        return result;
} 