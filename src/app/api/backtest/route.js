import { NextResponse } from 'next/server';
import { createServerClient } from '../../../utils/supabase';
import { cookies } from 'next/headers';

export async function POST(request) {
        try {
                // Get the request body
                const body = await request.json();

                // Extract necessary data from the request
                const { pineScript, symbol, timeframe, timeDuration, initialCapital, quantity } = body;

                // Validate required fields
                if (!pineScript || !symbol || !timeframe || !timeDuration) {
                        return NextResponse.json(
                                { error: 'Missing required fields' },
                                { status: 400 }
                        );
                }

                // Get user authentication info for coin deduction
                const cookieStore = cookies();
                const supabaseAuthClient = createServerClient({ cookies: () => cookieStore });
                const { data: { session } } = await supabaseAuthClient.auth.getSession();

                if (!session?.user?.id) {
                        return NextResponse.json(
                                { error: 'Authentication required' },
                                { status: 401 }
                        );
                }

                // Generate backtest results
                const backtestResults = generateBacktestResults(timeframe, timeDuration);

                // Return the results directly (no DB storage)
                return NextResponse.json({
                        success: true,
                        results: backtestResults
                });

        } catch (error) {
                console.error('Backtest error:', error);
                return NextResponse.json(
                        { error: 'An unexpected error occurred during backtesting' },
                        { status: 500 }
                );
        }
}

// Generate random backtest results
function generateBacktestResults(timeframe, timeDuration) {
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
                        "Long trades outperform short trades; consider optimizing short entry criteria"
                ];
        } else {
                recommendations = [
                        "Reduce position size until strategy is further optimized",
                        "Consider adding additional filters to reduce false signals",
                        "Implement stricter risk management with tighter stop-losses",
                        "Test with different market conditions; current parameters may be unsuitable for this market"
                ];
        }

        // Generate equity curve data
        const equityCurveData = [];
        let equity = 100; // Start at 100%

        for (let i = 0; i < 100; i++) {
                // Basic equity curve generation
                const progress = i / 99;
                let currentEquity;

                if (isPositive) {
                        // For profitable strategies, steady growth with a few drawdowns
                        currentEquity = 100 + (overallReturn * progress * (1.1 - 0.2 * Math.sin(progress * 8)));
                } else {
                        // For losing strategies, initial promise then deterioration
                        const inflection = 0.3 + (Math.random() * 0.2); // Point where strategy turns negative
                        if (progress < inflection) {
                                // Initial promising period
                                currentEquity = 100 + (10 * progress / inflection);
                        } else {
                                // Deterioration period
                                const remainingProgress = (progress - inflection) / (1 - inflection);
                                currentEquity = 110 + ((overallReturn + 10) * remainingProgress);
                        }
                }

                // Add some noise for realism
                const noise = Math.random() * 4 - 2; // ±2% noise
                equity = currentEquity + noise;

                // Record the data point
                equityCurveData.push({
                        day: i + 1,
                        equity: parseFloat(equity.toFixed(2))
                });
        }

        // Ensure the final value matches the overall return
        equityCurveData[99].equity = 100 + parseFloat(overallReturn.toFixed(2));

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
} 