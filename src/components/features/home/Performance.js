'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Performance = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Mock data for the chart
  const monthlyReturns = [4.2, -1.3, 5.7, 2.8, -0.9, 3.5, 6.1, 2.3, 4.8, -2.1, 7.2, 3.9];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Find the max value for scaling
  const maxValue = Math.max(...monthlyReturns.map(val => Math.abs(val)));

  // Calculate the height percentage for each bar
  const getBarHeight = value => {
    return (Math.abs(value) / maxValue) * 100;
  };

  return (
    <section id="performance" className="py-24 bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/10 to-transparent"></div>

      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Performance Metrics</h2>
          <p className="section-subtitle">
            Our algorithms consistently outperform market benchmarks with lower volatility and risk.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Performance Chart */}
          <motion.div
            className="card p-8"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-6">Monthly Returns (Last 12 Months)</h3>

            <div className="relative h-64">
              {/* Horizontal grid lines */}
              {[0, 25, 50, 75, 100].map((line, i) => (
                <div
                  key={i}
                  className="absolute w-full h-px bg-zinc-800"
                  style={{ bottom: `${line}%` }}
                >
                  <span className="absolute -left-8 -translate-y-1/2 text-xs text-zinc-500">
                    {((maxValue * line) / 100).toFixed(1)}%
                  </span>
                </div>
              ))}

              {/* Center line (0%) */}
              <div className="absolute w-full h-px bg-zinc-700" style={{ bottom: '50%' }}>
                <span className="absolute -left-8 -translate-y-1/2 text-xs text-zinc-500">
                  0.0%
                </span>
              </div>

              {/* Bars */}
              <div className="absolute bottom-[50%] left-0 right-0 flex justify-between items-end h-[50%]">
                {monthlyReturns.map((value, index) => {
                  const isPositive = value >= 0;
                  const height = getBarHeight(value);

                  return (
                    <motion.div
                      key={index}
                      className="relative group"
                      initial={{ height: 0 }}
                      animate={inView ? { height: `${height}%` } : { height: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                    >
                      <div
                        className={`w-5 ${isPositive ? 'bg-zinc-700' : 'bg-zinc-800'} hover:bg-zinc-600 transition-colors`}
                      ></div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap">
                        {months[index]}: {value > 0 ? '+' : ''}
                        {value.toFixed(1)}%
                      </div>

                      {/* Month label */}
                      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs text-zinc-500">
                        {months[index]}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Negative bars */}
              <div className="absolute top-[50%] left-0 right-0 flex justify-between items-start h-[50%]">
                {monthlyReturns.map((value, index) => {
                  const isNegative = value < 0;
                  const height = isNegative ? getBarHeight(value) : 0;

                  return (
                    <motion.div
                      key={index}
                      className="relative group"
                      initial={{ height: 0 }}
                      animate={inView ? { height: `${height}%` } : { height: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                    >
                      <div className="w-5 bg-zinc-800 hover:bg-zinc-600 transition-colors"></div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Key Statistics */}
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold mb-8">Key Performance Metrics</h3>

            <div className="space-y-6">
              {[
                {
                  label: 'Annual Return',
                  value: '24.7%',
                  description: 'Average annual return since inception',
                },
                {
                  label: 'Sharpe Ratio',
                  value: '2.31',
                  description: 'Higher risk-adjusted returns than market',
                },
                {
                  label: 'Max Drawdown',
                  value: '-12.4%',
                  description: 'Maximum observed loss from peak to trough',
                },
                {
                  label: 'Win Rate',
                  value: '68.3%',
                  description: 'Percentage of profitable trades',
                },
                {
                  label: 'Beta',
                  value: '0.42',
                  description: 'Lower volatility compared to market',
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <div className="mr-4 mt-1 w-1 h-8 bg-zinc-700"></div>
                  <div>
                    <div className="flex items-baseline">
                      <h4 className="text-lg font-medium mr-3">{stat.label}:</h4>
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                    <p className="text-zinc-400 text-sm mt-1">{stat.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-10"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <button className="btn-secondary">View Detailed Performance</button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Performance;
