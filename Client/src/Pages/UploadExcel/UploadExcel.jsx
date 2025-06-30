import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import PlotlyChart from '../../Components/PlotlyChart/PlotlyChart';
import { addActivity } from '../../Components/RecentActivity/RecentActivity';
import './UploadExcel.css';

const UploadExcel = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showPlotly, setShowPlotly] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setLoading(true);
    setUploadedFile(file);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const processedData = {
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + ' KB',
        sheets: workbook.SheetNames,
        rowCount: jsonData.length,
        columnCount: Object.keys(jsonData[0] || {}).length,
        data: jsonData.slice(0, 10),
        fullData: jsonData,
        uploadTime: new Date().toISOString()
      };

      setFileData(processedData);
      setRawData(jsonData);

      const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
      const fileRecord = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        rowCount: jsonData.length,
        columnCount: Object.keys(jsonData[0] || {}).length,
        data: jsonData
      };
      uploadedFiles.push(fileRecord);
      localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
      localStorage.setItem('rawData', JSON.stringify(jsonData));

      addActivity('upload', `Uploaded file: ${file.name}`, `${jsonData.length} rows, ${Object.keys(jsonData[0] || {}).length} columns`);

    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
      addActivity('upload', `Failed to upload file: ${file.name}`, 'Error during processing');
    } finally {
      setLoading(false);
    }
  };

  const analyzeData = async () => {
    if (!fileData || !fileData.fullData) return;

    setAnalyzing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const data = fileData.fullData;
      const numericColumns = [];
      const textColumns = [];
      
      if (data.length > 0) {
        Object.keys(data[0]).forEach(column => {
          const sampleValues = data.slice(0, 10).map(row => row[column]);
          const numericValues = sampleValues.filter(val => !isNaN(parseFloat(val)));
          
          if (numericValues.length > sampleValues.length * 0.7) {
            numericColumns.push(column);
          } else {
            textColumns.push(column);
          }
        });
      }

      const statistics = {};
      numericColumns.forEach(column => {
        const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
        if (values.length > 0) {
          statistics[column] = {
            count: values.length,
            sum: values.reduce((a, b) => a + b, 0),
            mean: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)]
          };
        }
      });

      const insights = [
        `Dataset contains ${data.length} records with ${Object.keys(data[0] || {}).length} attributes`,
        `Found ${numericColumns.length} numeric columns and ${textColumns.length} text columns`,
        `Data quality: ${((data.length - data.filter(row => Object.values(row).some(val => val === null || val === '')).length) / data.length * 100).toFixed(1)}% complete records`
      ];

      if (numericColumns.length > 0) {
        const mainColumn = numericColumns[0];
        const stats = statistics[mainColumn];
        insights.push(`${mainColumn}: Range ${stats.min} - ${stats.max}, Average ${stats.mean.toFixed(2)}`);
      }

      const results = {
        summary: {
          totalRows: data.length,
          totalColumns: Object.keys(data[0] || {}).length,
          numericColumns: numericColumns.length,
          textColumns: textColumns.length,
          completeness: ((data.length - data.filter(row => Object.values(row).some(val => val === null || val === '')).length) / data.length * 100).toFixed(1)
        },
        statistics,
        insights,
        recommendations: [
          'Consider removing incomplete records for better analysis',
          'Numeric columns are suitable for statistical analysis',
          'Text columns may benefit from categorical analysis',
          'Large dataset - consider sampling for faster processing'
        ],
        chartData: generateChartData(data, numericColumns[0])
      };

      setAnalysisResults(results);
      
      const analyses = JSON.parse(localStorage.getItem('analyses')) || [];
      analyses.push({
        id: Date.now(),
        fileName: fileData.fileName,
        timestamp: new Date().toISOString(),
        results
      });
      localStorage.setItem('analyses', JSON.stringify(analyses));
      localStorage.setItem('chartData', JSON.stringify(results.chartData));

      addActivity('analysis', `Analyzed data from ${fileData.fileName}`, `Generated ${insights.length} insights`);

    } catch (error) {
      console.error('Analysis error:', error);
      alert('Error during analysis. Please try again.');
      addActivity('analysis', `Failed to analyze ${fileData.fileName}`, 'Analysis error');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateChartData = (data, primaryColumn) => {
    if (!primaryColumn || data.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'No Data',
          data: [0],
          backgroundColor: ['#e2e8f0']
        }]
      };
    }

    const chartData = data.slice(0, 10);
    const labels = chartData.map((row, index) => row[Object.keys(row)[0]] || `Row ${index + 1}`);
    const values = chartData.map(row => parseFloat(row[primaryColumn]) || 0);

    return {
      labels,
      datasets: [{
        label: primaryColumn,
        data: values,
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(240, 147, 251, 0.8)',
          'rgba(245, 87, 108, 0.8)',
          'rgba(254, 202, 87, 0.8)',
          'rgba(72, 187, 120, 0.8)',
          'rgba(99, 179, 237, 0.8)',
          'rgba(161, 136, 127, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(201, 203, 207, 0.8)'
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(118, 75, 162, 1)',
          'rgba(240, 147, 251, 1)',
          'rgba(245, 87, 108, 1)',
          'rgba(254, 202, 87, 1)',
          'rgba(72, 187, 120, 1)',
          'rgba(99, 179, 237, 1)',
          'rgba(161, 136, 127, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(201, 203, 207, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    };
  };

  const saveFile = () => {
    if (fileData) {
      addActivity('export', `Saved processed data from ${fileData.fileName}`, 'Data saved to system');
      alert('File data saved successfully!');
    }
  };

  return (
    <div className="upload-excel">
      <div className="upload-header">
        <h1>📊 Data Ingestion Portal</h1>
        <p>Upload and analyze your datasets with advanced AI-powered insights</p>
      </div>

      <div className="upload-section">
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <h3>Drag and drop your Excel file here</h3>
            <p>or</p>
            <label className="upload-btn">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              Choose File
            </label>
            <p className="upload-note">Supports .xlsx and .xls files up to 10MB</p>
          </div>
        </div>

        {loading && (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Processing your file...</p>
          </div>
        )}

        {fileData && (
          <div className="file-preview">
            <div className="file-info">
              <h3>📊 File Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">File Name:</span>
                  <span className="info-value">{fileData.fileName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">File Size:</span>
                  <span className="info-value">{fileData.fileSize}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Rows:</span>
                  <span className="info-value">{fileData.rowCount.toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Columns:</span>
                  <span className="info-value">{fileData.columnCount}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Sheets:</span>
                  <span className="info-value">{fileData.sheets.join(', ')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Upload Time:</span>
                  <span className="info-value">{new Date(fileData.uploadTime).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="visualization-section">
              <div className="viz-header">
                <h3>📈 Data Visualization</h3>
                <div className="viz-controls">
                  <button
                    className={`viz-btn ${!showPlotly ? 'active' : ''}`}
                    onClick={() => setShowPlotly(false)}
                  >
                    📊 Table View
                  </button>
                  <button
                    className={`viz-btn ${showPlotly ? 'active' : ''}`}
                    onClick={() => setShowPlotly(true)}
                  >
                    🎯 Interactive Plots
                  </button>
                </div>
              </div>

              {showPlotly ? (
                <PlotlyChart data={rawData} />
              ) : (
                <div className="data-preview">
                  <div className="table-container">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          {Object.keys(fileData.data[0] || {}).map((key) => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {fileData.data.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, i) => (
                              <td key={i}>{String(value)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="preview-note">Showing first 10 rows of {fileData.rowCount.toLocaleString()} total rows</p>
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button 
                className="analyze-btn" 
                onClick={analyzeData}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <div className="btn-spinner"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    🧠 AI Analysis
                  </>
                )}
              </button>
              <button className="save-btn" onClick={saveFile}>
                💾 Save Data
              </button>
            </div>
          </div>
        )}

        {analysisResults && (
          <div className="analysis-results">
            <h3>🧠 AI Analysis Results</h3>
            
            <div className="results-grid">
              <div className="summary-card">
                <h4>📈 Data Summary</h4>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-number">{analysisResults.summary.totalRows.toLocaleString()}</span>
                    <span className="stat-label">Total Rows</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{analysisResults.summary.totalColumns}</span>
                    <span className="stat-label">Columns</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{analysisResults.summary.completeness}%</span>
                    <span className="stat-label">Data Quality</span>
                  </div>
                </div>
              </div>

              <div className="insights-card">
                <h4>💡 Key Insights</h4>
                <ul className="insights-list">
                  {analysisResults.insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>

              <div className="recommendations-card">
                <h4>🎯 Recommendations</h4>
                <ul className="recommendations-list">
                  {analysisResults.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadExcel;