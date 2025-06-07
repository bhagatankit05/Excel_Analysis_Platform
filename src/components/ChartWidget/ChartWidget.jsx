import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './ChartWidget.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ChartWidget = () => {
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Load saved chart data or create sample data
    const savedData = localStorage.getItem('chartData');
    if (savedData) {
      setChartData(JSON.parse(savedData));
    } else {
      // Sample data
      const sampleData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Data Analysis',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
              'rgba(102, 126, 234, 0.8)',
              'rgba(118, 75, 162, 0.8)',
              'rgba(240, 147, 251, 0.8)',
              'rgba(245, 87, 108, 0.8)',
              'rgba(254, 202, 87, 0.8)',
              'rgba(72, 187, 120, 0.8)',
            ],
            borderColor: [
              'rgba(102, 126, 234, 1)',
              'rgba(118, 75, 162, 1)',
              'rgba(240, 147, 251, 1)',
              'rgba(245, 87, 108, 1)',
              'rgba(254, 202, 87, 1)',
              'rgba(72, 187, 120, 1)',
            ],
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      };
      setChartData(sampleData);
    }
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      title: {
        display: true,
        text: 'Data Visualization',
        font: {
          size: 16,
          weight: '600',
        },
        padding: 20,
      },
    },
    scales: chartType !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    } : {},
  };

  const renderChart = () => {
    if (!chartData) return <div className="chart-loading">Loading chart...</div>;

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />;
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div className="chart-widget">
      <div className="chart-header">
        <h3>Analytics Overview</h3>
        <div className="chart-controls">
          <button
            className={`chart-btn ${chartType === 'bar' ? 'active' : ''}`}
            onClick={() => setChartType('bar')}
          >
            📊 Bar
          </button>
          <button
            className={`chart-btn ${chartType === 'line' ? 'active' : ''}`}
            onClick={() => setChartType('line')}
          >
            📈 Line
          </button>
          <button
            className={`chart-btn ${chartType === 'doughnut' ? 'active' : ''}`}
            onClick={() => setChartType('doughnut')}
          >
            🍩 Doughnut
          </button>
        </div>
      </div>
      <div className="chart-container">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartWidget;