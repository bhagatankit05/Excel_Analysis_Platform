import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');

  const handleFileUpload = e => {
    setError('');
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = event => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Read first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (jsonData.length === 0) {
        setError('Excel file is empty or improperly formatted.');
        return;
      }

      // Assume the sheet has a simple table with two columns: Label and Value
      // Adjust this part based on your Excel format
      const labels = jsonData.map(row => row['Label'] || row[Object.keys(row)[0]]);
      const values = jsonData.map(row => Number(row['Value'] || row[Object.keys(row)[1]]));

      if (labels.some(label => !label) || values.some(isNaN)) {
        setError('Excel data format error: Make sure first two columns are Label and Value.');
        return;
      }

      // Prepare chart data with gradient color scale
      const maxVal = Math.max(...values);
      const minVal = Math.min(...values);

      // Create colors based on value (red-green gradient)
      const getColor = val => {
        const ratio = (val - minVal) / (maxVal - minVal || 1);
        const r = Math.floor(255 * (1 - ratio)); // Red decreases as value increases
        const g = Math.floor(255 * ratio); // Green increases as value increases
        return `rgb(${r},${g},0)`;
      };

      const backgroundColors = values.map(getColor);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Values',
            data: values,
            backgroundColor: backgroundColors,
          },
        ],
      });
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard - Excel Data Visualization</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {error && <p className="error">{error}</p>}
      {chartData ? (
        <div className="chart-wrapper">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Excel Data Bar Chart' },
              },
            }}
          />
        </div>
      ) : (
        <p>Upload an Excel file with "Label" and "Value" columns to see the chart.</p>
      )}
    </div>
  );
};

export default Dashboard;
