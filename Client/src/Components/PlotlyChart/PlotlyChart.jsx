import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import './PlotlyChart.css';

const PlotlyChart = ({ data, onAxisChange }) => {
  const [chartType, setChartType] = useState('2d');
  const [selectedAxes, setSelectedAxes] = useState({
    x: '',
    y: '',
    z: ''
  });
  const [availableColumns, setAvailableColumns] = useState([]);
  const [plotData, setPlotData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      setAvailableColumns(columns);
      
      // Auto-select first few columns
      if (columns.length >= 2) {
        setSelectedAxes({
          x: columns[0],
          y: columns[1],
          z: columns[2] || columns[0]
        });
      }
    }
  }, [data]);

  useEffect(() => {
    if (data && selectedAxes.x && selectedAxes.y) {
      generatePlotData();
    }
  }, [data, selectedAxes, chartType]);

  const generatePlotData = () => {
    if (!data || data.length === 0) return;

    const xValues = data.map(row => row[selectedAxes.x]);
    const yValues = data.map(row => parseFloat(row[selectedAxes.y]) || 0);
    
    if (chartType === '2d') {
      const trace = {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'markers+lines',
        marker: {
          size: 8,
          color: yValues,
          colorscale: 'Viridis',
          showscale: true
        },
        line: {
          color: 'rgb(102, 126, 234)',
          width: 2
        },
        name: `${selectedAxes.y} vs ${selectedAxes.x}`
      };
      setPlotData([trace]);
    } else if (chartType === '3d' && selectedAxes.z) {
      const zValues = data.map(row => parseFloat(row[selectedAxes.z]) || 0);
      
      const trace = {
        x: xValues,
        y: yValues,
        z: zValues,
        type: 'scatter3d',
        mode: 'markers',
        marker: {
          size: 6,
          color: zValues,
          colorscale: 'Viridis',
          showscale: true,
          opacity: 0.8
        },
        name: `3D Plot: ${selectedAxes.x}, ${selectedAxes.y}, ${selectedAxes.z}`
      };
      setPlotData([trace]);
    }
  };

  const handleAxisChange = (axis, value) => {
    const newAxes = { ...selectedAxes, [axis]: value };
    setSelectedAxes(newAxes);
    if (onAxisChange) {
      onAxisChange(newAxes);
    }
  };

  const getLayout = () => {
    const baseLayout = {
      title: {
        text: `${chartType.toUpperCase()} Data Visualization`,
        font: { size: 18, color: '#1a202c' }
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#1a202c' },
      margin: { l: 60, r: 60, t: 80, b: 60 }
    };

    if (chartType === '2d') {
      return {
        ...baseLayout,
        xaxis: {
          title: selectedAxes.x,
          gridcolor: 'rgba(0,0,0,0.1)',
          zerolinecolor: 'rgba(0,0,0,0.2)'
        },
        yaxis: {
          title: selectedAxes.y,
          gridcolor: 'rgba(0,0,0,0.1)',
          zerolinecolor: 'rgba(0,0,0,0.2)'
        }
      };
    } else {
      return {
        ...baseLayout,
        scene: {
          xaxis: { title: selectedAxes.x },
          yaxis: { title: selectedAxes.y },
          zaxis: { title: selectedAxes.z },
          camera: {
            eye: { x: 1.5, y: 1.5, z: 1.5 }
          }
        }
      };
    }
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
    responsive: true
  };

  return (
    <div className="plotly-chart">
      <div className="chart-controls">
        <div className="control-group">
          <label>Chart Type:</label>
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value)}
            className="control-select"
          >
            <option value="2d">2D Plot</option>
            <option value="3d">3D Plot</option>
          </select>
        </div>

        <div className="axis-controls">
          <div className="axis-group">
            <label>X-Axis:</label>
            <select 
              value={selectedAxes.x} 
              onChange={(e) => handleAxisChange('x', e.target.value)}
              className="control-select"
            >
              <option value="">Select Column</option>
              {availableColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          <div className="axis-group">
            <label>Y-Axis:</label>
            <select 
              value={selectedAxes.y} 
              onChange={(e) => handleAxisChange('y', e.target.value)}
              className="control-select"
            >
              <option value="">Select Column</option>
              {availableColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {chartType === '3d' && (
            <div className="axis-group">
              <label>Z-Axis:</label>
              <select 
                value={selectedAxes.z} 
                onChange={(e) => handleAxisChange('z', e.target.value)}
                className="control-select"
              >
                <option value="">Select Column</option>
                {availableColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="plot-container">
        {plotData.length > 0 ? (
          <Plot
            data={plotData}
            layout={getLayout()}
            config={config}
            style={{ width: '100%', height: '500px' }}
          />
        ) : (
          <div className="no-data">
            <p>Select axes to generate plot</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlotlyChart;