'use client';

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register all Chart.js components
Chart.register(...registerables);

const StockChart = ({ selectedIndex = 'NIFTY' }) => {
  // Sample candlestick data (time, open, high, low, close)
  const generateMockData = (count = 50, seed = 0) => {
    const data = [];
    let basePrice = 100 + seed * 10; // Vary the base price based on the index
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const time = new Date(now);
      time.setMinutes(now.getMinutes() - (count - i) * 30);

      const open = basePrice + (Math.random() * 5 - 2.5);
      const close = open + (Math.random() * 6 - 3);
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;

      basePrice = close;

      data.push({
        x: time,
        o: parseFloat(open.toFixed(2)),
        h: parseFloat(high.toFixed(2)),
        l: parseFloat(low.toFixed(2)),
        c: parseFloat(close.toFixed(2)),
      });
    }

    return data;
  };

  // Generate different data based on the selected index
  let seed = 0;
  switch (selectedIndex) {
    case 'BANKNIFTY':
      seed = 1;
      break;
    case 'FINNIFTY':
      seed = 2;
      break;
    case 'SENSEX':
      seed = 3;
      break;
    case 'BANKEX':
      seed = 4;
      break;
    case 'MIDCAPNIFTY':
      seed = 5;
      break;
    default:
      seed = 0;
  }

  const stockData = generateMockData(50, seed);

  // Extract data for the line chart
  const chartData = {
    labels: stockData.map(candle => candle.x),
    datasets: [
      {
        label: selectedIndex,
        data: stockData.map(candle => candle.c),
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#4F46E5',
        pointHoverBorderColor: '#fff',
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'HH:mm',
          },
        },
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          maxRotation: 0,
        },
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function (value) {
            return value.toFixed(2);
          },
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (context) {
            const dataPoint = stockData[context.dataIndex];
            return [
              `Open: ${dataPoint.o}`,
              `High: ${dataPoint.h}`,
              `Low: ${dataPoint.l}`,
              `Close: ${dataPoint.c}`,
            ];
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
      legend: {
        display: true,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      title: {
        display: true,
        text: `${selectedIndex} Chart`,
        color: 'rgba(255, 255, 255, 0.9)',
        font: {
          size: 16,
        },
      },
    },
  };

  return (
    <div className="bg-black border border-gray-700 rounded-lg p-4 w-full">
      <div className="h-[400px] w-full">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default StockChart;
