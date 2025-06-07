import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './UploadExcel.css';

const UploadExcel = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);

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

      setFileData({
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + ' KB',
        sheets: workbook.SheetNames,
        rowCount: jsonData.length,
        data: jsonData.slice(0, 10), // Preview first 10 rows
        fullData: jsonData
      });

      // Save to localStorage
      const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
      uploadedFiles.push({
        id: Date.now(),
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        data: jsonData
      });
      localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));

    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processForAnalysis = () => {
    if (fileData && fileData.fullData) {
      // Navigate to analysis page with data
      localStorage.setItem('currentAnalysisData', JSON.stringify(fileData.fullData));
      window.location.href = '/analyze';
    }
  };

  return (
    <div className="upload-excel">
      <div className="upload-header">
        <h1>Upload Excel File</h1>
        <p>Upload your Excel files to start analyzing your data</p>
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
                  <span className="info-label">Sheets:</span>
                  <span className="info-value">{fileData.sheets.join(', ')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Rows:</span>
                  <span className="info-value">{fileData.rowCount}</span>
                </div>
              </div>
            </div>

            <div className="data-preview">
              <h3>📋 Data Preview</h3>
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
              <p className="preview-note">Showing first 10 rows</p>
            </div>

            <div className="action-buttons">
              <button className="analyze-btn" onClick={processForAnalysis}>
                🔍 Analyze Data
              </button>
              <button className="save-btn">
                💾 Save File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadExcel;