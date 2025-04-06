# PineScript Optimizer

The PineScript Optimizer is a powerful feature that allows you to optimize your TradingView Pine Script strategies by finding the best parameter combinations for maximum performance.

## Overview

This feature enables you to:

1. Parse and analyze your Pine Script code to identify optimizable parameters
2. Run exhaustive or targeted optimizations to find the best parameter combinations
3. Save optimization results to your account for future reference
4. Run backtests with optimized parameters to verify performance
5. Compare optimized and original parameters side-by-side
6. View detailed analytics and performance metrics

## Getting Started

### 1. Input Your Pine Script

Navigate to the Optimization page and paste your TradingView Pine Script code into the editor. The system will automatically parse your code to identify parameters that can be optimized.

### 2. Configure Parameters

After parsing your code, you'll see a list of detected parameters. For each parameter, you can set:

- Min value
- Max value
- Step size
- Whether to include it in optimization

### 3. Set Test Configuration

Configure your test settings:

- Symbol (e.g., AAPL, BTCUSD)
- Timeframe (1m, 5m, 15m, 1h, 4h, 1D, etc.)
- Time Duration (test period)
- Initial Capital
- Contract Size

### 4. Run Optimization

Choose between:

- **Non-Exhaustive Optimization**: Faster, uses smart algorithms to find good parameter combinations
- **Exhaustive Optimization**: Slower, tests all possible parameter combinations for maximum accuracy

### 5. Review Results

Once optimization completes, you'll see:

- Best parameter combinations found
- Performance metrics (Return, Win Rate, Profit Factor, Max Drawdown, etc.)
- Heat maps showing the relationship between parameters and performance
- Detailed performance statistics

### 6. Run Backtest

After optimization, you can run a backtest with the optimized parameters to verify performance on historical data. This lets you:

- Compare optimized parameters vs. original settings
- View detailed trade history and performance metrics
- Get specific recommendations for further improvements

## API Endpoints

The PineScript Optimizer uses the following API endpoints:

- `/api/optimize` - Analyze script and run optimization
- `/api/backtest` - Run backtest with optimized parameters
- `/api/history` - Get optimization and backtest history
- `/api/get-optimization` - Get detailed results for a specific optimization

## Database Schema

The feature uses two main database tables:

1. `optimizations` - Stores optimization runs and results
2. `backtests` - Stores backtest runs linked to optimizations

## Security Features

The PineScript Optimizer implements several security measures:

- JWT-based authentication using Supabase Auth
- Server-side validation for all inputs
- Role-based access control (RBAC)
- API rate limiting to prevent abuse
- Audit logging of optimization and backtest operations

## Best Practices

1. **Start Small**: Begin with a narrow parameter range and increase gradually
2. **Avoid Overfitting**: Be cautious of strategies that perform extremely well on historical data but may fail on future data
3. **Use Multiple Timeframes**: Test your optimized strategy on different timeframes
4. **Save Important Results**: Bookmark your best optimization results for future reference
5. **Compare with Original**: Always compare optimized results with your original strategy

## Troubleshooting

If you encounter issues:

- Ensure your Pine Script syntax is correct
- Check that you've set reasonable parameter ranges
- Verify your symbol and timeframe combination is valid
- For large parameter spaces, try non-exhaustive optimization first

## Limitations

- Maximum script size: 100KB
- Maximum optimization time: 30 minutes
- Maximum parameters per optimization: 10
- Rate limits: 5 optimizations per hour for standard accounts 