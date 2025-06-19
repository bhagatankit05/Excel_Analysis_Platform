import React, { useState, useEffect } from 'react';
import { Bar, Line, Scatter, Doughnut } from 'react-chartjs-2';
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
import { useAuth } from '../../context/AuthContext';

import { addActivity } from '../../components/RecentActivity/RecentActivity.jsx';

import './DeepAnalysis.css';

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

const DeepAnalysis = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [analysisType, setAnalysisType] = useState('statistical');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [activeSection, setActiveSection] = useState('statistical');

  const analysisTypes = [
    { id: 'statistical', name: 'Statistical Analysis', icon: '📊' },
    { id: 'correlation', name: 'Correlation Analysis', icon: '🔗' },
    { id: 'trend', name: 'Trend Analysis', icon: '📈' },
    { id: 'outliers', name: 'Outlier Detection', icon: '🎯' },
    { id: 'clustering', name: 'Clustering Analysis', icon: '🎪' },
    { id: 'quality', name: 'Data Quality Assessment', icon: '✅' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const rawData = JSON.parse(localStorage.getItem('rawData'));
    const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
    
    if (rawData && rawData.length > 0) {
      setData(rawData);
      const columns = Object.keys(rawData[0]);
      setSelectedColumns(columns.slice(0, 3)); // Select first 3 columns by default
    } else if (uploadedFiles.length > 0) {
      const latestFile = uploadedFiles[uploadedFiles.length - 1];
      setData(latestFile.data);
      if (latestFile.data && latestFile.data.length > 0) {
        const columns = Object.keys(latestFile.data[0]);
        setSelectedColumns(columns.slice(0, 3));
      }
    }
  };

  const runAnalysis = async () => {
    if (!data || selectedColumns.length === 0) {
      alert('Please ensure data is loaded and columns are selected');
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      
      const analysisResults = {};
      
      // Statistical Analysis
      if (analysisType === 'statistical' || analysisType === 'all') {
        analysisResults.statistical = performStatisticalAnalysis();
      }
      
      // Correlation Analysis
      if (analysisType === 'correlation' || analysisType === 'all') {
        analysisResults.correlation = performCorrelationAnalysis();
      }
      
      // Trend Analysis
      if (analysisType === 'trend' || analysisType === 'all') {
        analysisResults.trend = performTrendAnalysis();
      }
      
      // Outlier Detection
      if (analysisType === 'outliers' || analysisType === 'all') {
        analysisResults.outliers = performOutlierDetection();
      }
      
      // Clustering Analysis
      if (analysisType === 'clustering' || analysisType === 'all') {
        analysisResults.clustering = performClusteringAnalysis();
      }
      
      // Data Quality Assessment
      if (analysisType === 'quality' || analysisType === 'all') {
        analysisResults.quality = performQualityAssessment();
      }
      
      setResults(analysisResults);
      setActiveSection(analysisType);
      
      addActivity('analysis', `Performed ${analysisType} analysis`, `Analyzed ${selectedColumns.length} columns`);
      
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Error during analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const performStatisticalAnalysis = () => {
    const numericColumns = getNumericColumns();
    const stats = {};
    
    numericColumns.forEach(column => {
      const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
      
      if (values.length > 0) {
        const sorted = values.sort((a, b) => a - b);
        const sum = values.reduce((acc, val) => acc + val, 0);
        const mean = sum / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        
        stats[column] = {
          count: values.length,
          sum: sum,
          mean: mean,
          median: sorted[Math.floor(sorted.length / 2)],
          mode: findMode(values),
          min: Math.min(...values),
          max: Math.max(...values),
          range: Math.max(...values) - Math.min(...values),
          variance: variance,
          standardDeviation: Math.sqrt(variance),
          skewness: calculateSkewness(values, mean, Math.sqrt(variance)),
          kurtosis: calculateKurtosis(values, mean, Math.sqrt(variance))
        };
      }
    });
    
    return {
      statistics: stats,
      distributionChart: generateDistributionChart(numericColumns[0])
    };
  };

  const performCorrelationAnalysis = () => {
    const numericColumns = getNumericColumns();
    const correlationMatrix = {};
    
    numericColumns.forEach(col1 => {
      correlationMatrix[col1] = {};
      numericColumns.forEach(col2 => {
        correlationMatrix[col1][col2] = calculateCorrelation(col1, col2);
      });
    });
    
    return {
      matrix: correlationMatrix,
      strongCorrelations: findStrongCorrelations(correlationMatrix),
      heatmapData: generateCorrelationHeatmap(correlationMatrix)
    };
  };

  const performTrendAnalysis = () => {
    const numericColumns = getNumericColumns();
    const trends = {};
    
    numericColumns.forEach(column => {
      const values = data.map((row, index) => ({ x: index, y: parseFloat(row[column]) }))
                       .filter(point => !isNaN(point.y));
      
      if (values.length > 1) {
        const trend = calculateTrend(values);
        trends[column] = {
          slope: trend.slope,
          direction: trend.slope > 0 ? 'increasing' : trend.slope < 0 ? 'decreasing' : 'stable',
          strength: Math.abs(trend.correlation),
          rSquared: Math.pow(trend.correlation, 2),
          forecast: generateForecast(values, 5)
        };
      }
    });
    
    return {
      trends: trends,
      trendChart: generateTrendChart(),
      insights: generateTrendInsights(trends)
    };
  };

  const performOutlierDetection = () => {
    const numericColumns = getNumericColumns();
    const outliers = {};
    
    numericColumns.forEach(column => {
      const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
      const q1 = percentile(values, 25);
      const q3 = percentile(values, 75);
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      const columnOutliers = data.map((row, index) => {
        const value = parseFloat(row[column]);
        if (!isNaN(value) && (value < lowerBound || value > upperBound)) {
          return {
            index: index,
            value: value,
            severity: value < lowerBound ? 'low' : 'high',
            score: Math.abs(value - (value < lowerBound ? lowerBound : upperBound))
          };
        }
        return null;
      }).filter(outlier => outlier !== null);
      
      outliers[column] = columnOutliers;
    });
    
    return {
      outliers: outliers,
      boxPlotChart: generateBoxPlotChart(),
      summary: generateOutlierSummary(outliers)
    };
  };

  const performClusteringAnalysis = () => {
    const numericColumns = getNumericColumns().slice(0, 2); // Use first 2 numeric columns
    
    if (numericColumns.length < 2) {
      return {
        error: 'Need at least 2 numeric columns for clustering analysis'
      };
    }
    
    const points = data.map(row => [
      parseFloat(row[numericColumns[0]]) || 0,
      parseFloat(row[numericColumns[1]]) || 0
    ]);
    
    const clusters = performKMeansClustering(points, 3);
    
    return {
      clusters: clusters,
      clusterChart: generateClusterChart(points, clusters),
      summary: generateClusterSummary(clusters)
    };
  };

  const performQualityAssessment = () => {
    const totalRows = data.length;
    const columns = Object.keys(data[0] || {});
    
    let completeness = 0;
    let consistency = 0;
    let accuracy = 0;
    let validity = 0;
    
    const issues = [];
    
    columns.forEach(column => {
      const values = data.map(row => row[column]);
      const nonNullValues = values.filter(val => val !== null && val !== undefined && val !== '');
      
      // Completeness
      const columnCompleteness = (nonNullValues.length / totalRows) * 100;
      completeness += columnCompleteness;
      
      if (columnCompleteness < 90) {
        issues.push({
          type: 'completeness',
          severity: columnCompleteness < 50 ? 'high' : 'medium',
          description: `Column "${column}" has ${(100 - columnCompleteness).toFixed(1)}% missing values`
        });
      }
      
      // Consistency (check for data type consistency)
      const types = [...new Set(nonNullValues.map(val => typeof val))];
      if (types.length > 1) {
        consistency += 50; // Penalize mixed types
        issues.push({
          type: 'consistency',
          severity: 'medium',
          description: `Column "${column}" has mixed data types: ${types.join(', ')}`
        });
      } else {
        consistency += 100;
      }
      
      // Validity (check for reasonable values in numeric columns)
      if (isNumericColumn(column)) {
        const numericValues = nonNullValues.map(val => parseFloat(val)).filter(val => !isNaN(val));
        const invalidCount = nonNullValues.length - numericValues.length;
        
        if (invalidCount > 0) {
          validity += ((numericValues.length / nonNullValues.length) * 100);
          issues.push({
            type: 'validity',
            severity: 'low',
            description: `Column "${column}" has ${invalidCount} invalid numeric values`
          });
        } else {
          validity += 100;
        }
      } else {
        validity += 100;
      }
    });
    
    completeness = completeness / columns.length;
    consistency = consistency / columns.length;
    validity = validity / columns.length;
    accuracy = (completeness + consistency + validity) / 3;
    
    return {
      scores: {
        overall: accuracy,
        completeness: completeness,
        consistency: consistency,
        validity: validity
      },
      issues: issues,
      recommendations: generateQualityRecommendations(issues)
    };
  };

  // Helper functions
  const getNumericColumns = () => {
    if (!data || data.length === 0) return [];
    
    return Object.keys(data[0]).filter(column => {
      const sampleValues = data.slice(0, 10).map(row => row[column]);
      const numericValues = sampleValues.filter(val => !isNaN(parseFloat(val)));
      return numericValues.length > sampleValues.length * 0.7;
    });
  };

  const isNumericColumn = (column) => {
    const sampleValues = data.slice(0, 10).map(row => row[column]);
    const numericValues = sampleValues.filter(val => !isNaN(parseFloat(val)));
    return numericValues.length > sampleValues.length * 0.7;
  };

  const findMode = (values) => {
    const frequency = {};
    values.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    
    let maxFreq = 0;
    let mode = null;
    
    Object.keys(frequency).forEach(val => {
      if (frequency[val] > maxFreq) {
        maxFreq = frequency[val];
        mode = parseFloat(val);
      }
    });
    
    return mode;
  };

  const calculateSkewness = (values, mean, stdDev) => {
    const n = values.length;
    const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sum;
  };

  const calculateKurtosis = (values, mean, stdDev) => {
    const n = values.length;
    const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0);
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
  };

  const calculateCorrelation = (col1, col2) => {
    const values1 = data.map(row => parseFloat(row[col1])).filter(val => !isNaN(val));
    const values2 = data.map(row => parseFloat(row[col2])).filter(val => !isNaN(val));
    
    if (values1.length !== values2.length || values1.length === 0) return 0;
    
    const mean1 = values1.reduce((acc, val) => acc + val, 0) / values1.length;
    const mean2 = values2.reduce((acc, val) => acc + val, 0) / values2.length;
    
    let numerator = 0;
    let sum1 = 0;
    let sum2 = 0;
    
    for (let i = 0; i < values1.length; i++) {
      const diff1 = values1[i] - mean1;
      const diff2 = values2[i] - mean2;
      numerator += diff1 * diff2;
      sum1 += diff1 * diff1;
      sum2 += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sum1 * sum2);
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const findStrongCorrelations = (matrix) => {
    const strong = [];
    const columns = Object.keys(matrix);
    
    for (let i = 0; i < columns.length; i++) {
      for (let j = i + 1; j < columns.length; j++) {
        const correlation = matrix[columns[i]][columns[j]];
        if (Math.abs(correlation) > 0.7) {
          strong.push({
            col1: columns[i],
            col2: columns[j],
            correlation: correlation,
            strength: Math.abs(correlation) > 0.9 ? 'very strong' : 'strong'
          });
        }
      }
    }
    
    return strong;
  };

  const calculateTrend = (points) => {
    const n = points.length;
    const sumX = points.reduce((acc, point) => acc + point.x, 0);
    const sumY = points.reduce((acc, point) => acc + point.y, 0);
    const sumXY = points.reduce((acc, point) => acc + point.x * point.y, 0);
    const sumXX = points.reduce((acc, point) => acc + point.x * point.x, 0);
    const sumYY = points.reduce((acc, point) => acc + point.y * point.y, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const correlation = (n * sumXY - sumX * sumY) / 
                       Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return { slope, intercept, correlation };
  };

  const generateForecast = (points, periods) => {
    const trend = calculateTrend(points);
    const lastX = Math.max(...points.map(p => p.x));
    
    const forecast = [];
    for (let i = 1; i <= periods; i++) {
      const x = lastX + i;
      const y = trend.slope * x + trend.intercept;
      forecast.push({ x, y });
    }
    
    return forecast;
  };

  const percentile = (values, p) => {
    const sorted = values.sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    
    if (Math.floor(index) === index) {
      return sorted[index];
    } else {
      const lower = sorted[Math.floor(index)];
      const upper = sorted[Math.ceil(index)];
      return lower + (upper - lower) * (index - Math.floor(index));
    }
  };

  const performKMeansClustering = (points, k) => {
    // Simple K-means implementation
    let centroids = [];
    
    // Initialize centroids randomly
    for (let i = 0; i < k; i++) {
      const randomPoint = points[Math.floor(Math.random() * points.length)];
      centroids.push([...randomPoint]);
    }
    
    let clusters = new Array(k).fill().map(() => []);
    let changed = true;
    let iterations = 0;
    
    while (changed && iterations < 100) {
      changed = false;
      clusters = new Array(k).fill().map(() => []);
      
      // Assign points to nearest centroid
      points.forEach((point, index) => {
        let minDistance = Infinity;
        let clusterIndex = 0;
        
        centroids.forEach((centroid, i) => {
          const distance = Math.sqrt(
            Math.pow(point[0] - centroid[0], 2) + Math.pow(point[1] - centroid[1], 2)
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            clusterIndex = i;
          }
        });
        
        clusters[clusterIndex].push({ point, index });
      });
      
      // Update centroids
      centroids.forEach((centroid, i) => {
        if (clusters[i].length > 0) {
          const newCentroid = [
            clusters[i].reduce((acc, item) => acc + item.point[0], 0) / clusters[i].length,
            clusters[i].reduce((acc, item) => acc + item.point[1], 0) / clusters[i].length
          ];
          
          if (newCentroid[0] !== centroid[0] || newCentroid[1] !== centroid[1]) {
            changed = true;
            centroids[i] = newCentroid;
          }
        }
      });
      
      iterations++;
    }
    
    return { clusters, centroids };
  };

  const generateDistributionChart = (column) => {
    if (!column || !data) return null;
    
    const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
    const bins = 10;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / bins;
    
    const histogram = new Array(bins).fill(0);
    const labels = [];
    
    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binSize;
      const binEnd = min + (i + 1) * binSize;
      labels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
      
      values.forEach(value => {
        if (value >= binStart && (value < binEnd || i === bins - 1)) {
          histogram[i]++;
        }
      });
    }
    
    return {
      labels,
      datasets: [{
        label: 'Frequency',
        data: histogram,
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1
      }]
    };
  };

  const generateCorrelationHeatmap = (matrix) => {
    // This would typically generate a heatmap visualization
    // For now, return the matrix data
    return matrix;
  };

  const generateTrendChart = () => {
    const numericColumns = getNumericColumns();
    if (numericColumns.length === 0) return null;
    
    const column = numericColumns[0];
    const values = data.map((row, index) => ({
      x: index,
      y: parseFloat(row[column]) || 0
    }));
    
    return {
      labels: values.map((_, index) => `Point ${index + 1}`),
      datasets: [{
        label: column,
        data: values.map(point => point.y),
        borderColor: 'rgba(102, 126, 234, 1)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4
      }]
    };
  };

  const generateTrendInsights = (trends) => {
    const insights = [];
    
    Object.keys(trends).forEach(column => {
      const trend = trends[column];
      insights.push({
        column,
        insight: `${column} shows a ${trend.direction} trend with ${trend.strength > 0.7 ? 'strong' : trend.strength > 0.4 ? 'moderate' : 'weak'} correlation (R² = ${trend.rSquared.toFixed(3)})`
      });
    });
    
    return insights;
  };

  const generateBoxPlotChart = () => {
    // Simplified box plot representation
    const numericColumns = getNumericColumns();
    if (numericColumns.length === 0) return null;
    
    return {
      labels: numericColumns,
      datasets: [{
        label: 'Data Distribution',
        data: numericColumns.map(column => {
          const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
          return {
            min: Math.min(...values),
            q1: percentile(values, 25),
            median: percentile(values, 50),
            q3: percentile(values, 75),
            max: Math.max(...values)
          };
        }),
        backgroundColor: 'rgba(102, 126, 234, 0.6)'
      }]
    };
  };

  const generateOutlierSummary = (outliers) => {
    const summary = {};
    
    Object.keys(outliers).forEach(column => {
      summary[column] = {
        count: outliers[column].length,
        percentage: ((outliers[column].length / data.length) * 100).toFixed(2)
      };
    });
    
    return summary;
  };

  const generateClusterChart = (points, clusters) => {
    const colors = ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 205, 86, 0.6)'];
    
    const datasets = clusters.clusters.map((cluster, index) => ({
      label: `Cluster ${index + 1}`,
      data: cluster.map(item => ({ x: item.point[0], y: item.point[1] })),
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length].replace('0.6', '1'),
      pointRadius: 5
    }));
    
    return { datasets };
  };

  const generateClusterSummary = (clusters) => {
    return clusters.clusters.map((cluster, index) => ({
      id: index + 1,
      size: cluster.length,
      centroid: clusters.centroids[index],
      percentage: ((cluster.length / data.length) * 100).toFixed(2)
    }));
  };

  const generateQualityRecommendations = (issues) => {
    const recommendations = [];
    
    const completenessIssues = issues.filter(issue => issue.type === 'completeness');
    if (completenessIssues.length > 0) {
      recommendations.push('Consider data imputation techniques for missing values');
      recommendations.push('Investigate the source of missing data to prevent future gaps');
    }
    
    const consistencyIssues = issues.filter(issue => issue.type === 'consistency');
    if (consistencyIssues.length > 0) {
      recommendations.push('Standardize data types across columns');
      recommendations.push('Implement data validation rules at the source');
    }
    
    const validityIssues = issues.filter(issue => issue.type === 'validity');
    if (validityIssues.length > 0) {
      recommendations.push('Clean invalid values and establish data entry constraints');
      recommendations.push('Consider automated data validation processes');
    }
    
    return recommendations;
  };

  const exportResults = (format) => {
    const exportData = {
      analysisType,
      selectedColumns,
      results,
      timestamp: new Date().toISOString(),
      user: user?.username
    };
    
    if (format === 'json') {
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `deep-analysis-${analysisType}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // Export statistical results as CSV
      if (results.statistical) {
        const csvContent = generateStatisticsCSV(results.statistical.statistics);
        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `statistics-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }
    
    addActivity('export', `Exported ${analysisType} analysis results`, `Format: ${format.toUpperCase()}`);
  };

  const generateStatisticsCSV = (statistics) => {
    const headers = ['Column', 'Count', 'Mean', 'Median', 'Min', 'Max', 'Std Dev', 'Variance'];
    const rows = [headers.join(',')];
    
    Object.keys(statistics).forEach(column => {
      const stats = statistics[column];
      const row = [
        column,
        stats.count,
        stats.mean.toFixed(4),
        stats.median.toFixed(4),
        stats.min.toFixed(4),
        stats.max.toFixed(4),
        stats.standardDeviation.toFixed(4),
        stats.variance.toFixed(4)
      ];
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  };

  const renderStatisticalAnalysis = () => {
    if (!results.statistical) return null;
    
    const { statistics, distributionChart } = results.statistical;
    
    return (
      <div className="analysis-section">
        <div className="section-header">
          <h3>📊 Statistical Analysis</h3>
        </div>
        
        <div className="stats-grid">
          {Object.keys(statistics).map(column => (
            <div key={column} className="stat-card">
              <h4>{column}</h4>
              <div className="stat-value">{statistics[column].mean.toFixed(2)}</div>
              <div className="stat-label">Mean</div>
            </div>
          ))}
        </div>
        
        {distributionChart && (
          <div className="distribution-chart">
            <h4>Distribution Chart</h4>
            <Bar data={distributionChart} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        )}
        
        <div className="detailed-stats">
          <h4>Detailed Statistics</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f7fafc' }}>
                  <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Column</th>
                  <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Count</th>
                  <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Mean</th>
                  <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Median</th>
                  <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Std Dev</th>
                  <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Min</th>
                  <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Max</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(statistics).map(column => (
                  <tr key={column}>
                    <td style={{ padding: '8px', border: '1px solid #e2e8f0', fontWeight: '600' }}>{column}</td>
                    <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{statistics[column].count}</td>
                    <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{statistics[column].mean.toFixed(4)}</td>
                    <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{statistics[column].median.toFixed(4)}</td>
                    <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{statistics[column].standardDeviation.toFixed(4)}</td>
                    <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{statistics[column].min.toFixed(4)}</td>
                    <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{statistics[column].max.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderCorrelationAnalysis = () => {
    if (!results.correlation) return null;
    
    const { matrix, strongCorrelations } = results.correlation;
    const columns = Object.keys(matrix);
    
    return (
      <div className="analysis-section">
        <div className="section-header">
          <h3>🔗 Correlation Analysis</h3>
        </div>
        
        <div className="correlation-matrix">
          <h4>Correlation Matrix</h4>
          <table className="correlation-table">
            <thead>
              <tr>
                <th></th>
                {columns.map(col => <th key={col}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {columns.map(row => (
                <tr key={row}>
                  <th>{row}</th>
                  {columns.map(col => {
                    const correlation = matrix[row][col];
                    const intensity = Math.abs(correlation);
                    const color = correlation > 0 ? 
                      `rgba(72, 187, 120, ${intensity})` : 
                      `rgba(245, 87, 108, ${intensity})`;
                    
                    return (
                      <td key={col} className="correlation-cell" style={{ backgroundColor: color }}>
                        {correlation.toFixed(3)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {strongCorrelations.length > 0 && (
          <div className="strong-correlations">
            <h4>Strong Correlations (|r| {'>'}0.7)</h4>
            {strongCorrelations.map((corr, index) => (
              <div key={index} className="correlation-item" style={{ 
                padding: '12px', 
                margin: '8px 0', 
                background: '#f7fafc', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <strong>{corr.col1}</strong> ↔ <strong>{corr.col2}</strong>: {corr.correlation.toFixed(3)} ({corr.strength})
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTrendAnalysis = () => {
    if (!results.trend) return null;
    
    const { trends, trendChart, insights } = results.trend;
    
    return (
      <div className="analysis-section">
        <div className="section-header">
          <h3>📈 Trend Analysis</h3>
        </div>
        
        {trendChart && (
          <div className="trend-chart">
            <h4>Trend Visualization</h4>
            <Line data={trendChart} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        )}
        
        <div className="trend-insights">
          {insights.map((insight, index) => (
            <div key={index} className="trend-insight">
              <h4>{insight.column}</h4>
              <p>{insight.insight}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOutlierDetection = () => {
    if (!results.outliers) return null;
    
    const { outliers, summary } = results.outliers;
    
    return (
      <div className="analysis-section">
        <div className="section-header">
          <h3>🎯 Outlier Detection</h3>
        </div>
        
        <div className="outliers-grid">
          <div className="outliers-summary">
            <h4>Outlier Summary</h4>
            {Object.keys(summary).map(column => (
              <div key={column} className="outlier-summary-item" style={{
                padding: '12px',
                margin: '8px 0',
                background: '#f7fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <strong>{column}</strong>: {summary[column].count} outliers ({summary[column].percentage}%)
              </div>
            ))}
          </div>
          
          <div className="outliers-list">
            <h4>Detected Outliers</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {Object.keys(outliers).map(column => 
                outliers[column].slice(0, 10).map((outlier, index) => (
                  <div key={`${column}-${index}`} className="outlier-item">
                    <span><strong>{column}</strong> Row {outlier.index + 1}</span>
                    <span className="outlier-value">{outlier.value.toFixed(2)}</span>
                    <span className="outlier-score">Score: {outlier.score.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderClusteringAnalysis = () => {
    if (!results.clustering) return null;
    
    if (results.clustering.error) {
      return (
        <div className="analysis-section">
          <div className="section-header">
            <h3>🎪 Clustering Analysis</h3>
          </div>
          <div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>
            {results.clustering.error}
          </div>
        </div>
      );
    }
    
    const { clusterChart, summary } = results.clustering;
    
    return (
      <div className="analysis-section">
        <div className="section-header">
          <h3>🎪 Clustering Analysis</h3>
        </div>
        
        {clusterChart && (
          <div className="clusters-visualization">
            <h4>Cluster Visualization</h4>
            <Scatter data={clusterChart} options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              scales: {
                x: { title: { display: true, text: 'X Axis' } },
                y: { title: { display: true, text: 'Y Axis' } }
              }
            }} />
          </div>
        )}
        
        <div className="cluster-summary">
          {summary.map(cluster => (
            <div key={cluster.id} className="cluster-card">
              <h4>Cluster {cluster.id}</h4>
              <div className="cluster-stats">
                <div>Size: {cluster.size} points ({cluster.percentage}%)</div>
                <div>Centroid: ({cluster.centroid[0].toFixed(2)}, {cluster.centroid[1].toFixed(2)})</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQualityAssessment = () => {
    if (!results.quality) return null;
    
    const { scores, issues, recommendations } = results.quality;
    
    const getQualityClass = (score) => {
      if (score >= 90) return 'excellent';
      if (score >= 75) return 'good';
      if (score >= 60) return 'fair';
      return 'poor';
    };
    
    return (
      <div className="analysis-section">
        <div className="section-header">
          <h3>✅ Data Quality Assessment</h3>
        </div>
        
        <div className="quality-metrics">
          <div className="quality-metric">
            <div className={`quality-score ${getQualityClass(scores.overall)}`}>
              {scores.overall.toFixed(0)}%
            </div>
            <div className="quality-label">Overall Quality</div>
          </div>
          <div className="quality-metric">
            <div className={`quality-score ${getQualityClass(scores.completeness)}`}>
              {scores.completeness.toFixed(0)}%
            </div>
            <div className="quality-label">Completeness</div>
          </div>
          <div className="quality-metric">
            <div className={`quality-score ${getQualityClass(scores.consistency)}`}>
              {scores.consistency.toFixed(0)}%
            </div>
            <div className="quality-label">Consistency</div>
          </div>
          <div className="quality-metric">
            <div className={`quality-score ${getQualityClass(scores.validity)}`}>
              {scores.validity.toFixed(0)}%
            </div>
            <div className="quality-label">Validity</div>
          </div>
        </div>
        
        {issues.length > 0 && (
          <div className="quality-issues">
            <h4>Quality Issues</h4>
            {issues.map((issue, index) => (
              <div key={index} className="issue-item">
                <span className={`issue-severity ${issue.severity}`}>{issue.severity}</span>
                <span className="issue-description">{issue.description}</span>
              </div>
            ))}
          </div>
        )}
        
        {recommendations.length > 0 && (
          <div className="quality-recommendations">
            <h4>Recommendations</h4>
            <ul style={{ paddingLeft: '20px' }}>
              {recommendations.map((rec, index) => (
                <li key={index} style={{ marginBottom: '8px', color: '#4a5568' }}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (!data) {
    return (
      <div className="deep-analysis">
        <div className="analysis-header">
          <div className="header-content">
            <h1>🔍 Deep Analysis Engine</h1>
            <p>Advanced statistical analysis and data mining</p>
          </div>
        </div>
        
        <div className="analysis-section">
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#718096' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3>No Data Available</h3>
            <p>Please upload an Excel file first to perform deep analysis.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="deep-analysis">
      <div className="analysis-header">
        <div className="header-content">
          <h1>🔍 Deep Analysis Engine</h1>
          <p>Advanced statistical analysis and data mining capabilities</p>
        </div>
        
        <div className="analysis-controls">
          <div className="control-group">
            <label>Analysis Type</label>
            <select 
              value={analysisType} 
              onChange={(e) => setAnalysisType(e.target.value)}
              className="analysis-select"
            >
              {analysisTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
              <option value="all">🎯 Complete Analysis</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Columns ({selectedColumns.length} selected)</label>
            <select 
              multiple
              value={selectedColumns}
              onChange={(e) => setSelectedColumns(Array.from(e.target.selectedOptions, option => option.value))}
              className="analysis-select"
              style={{ height: '80px' }}
            >
              {data && Object.keys(data[0] || {}).map(column => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="run-analysis-btn" 
            onClick={runAnalysis}
            disabled={loading || selectedColumns.length === 0}
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                Analyzing...
              </>
            ) : (
              <>
                <span>🚀</span>
                Run Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <div className="analysis-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">Processing your data...</div>
          <div className="loading-progress">
            <div className="progress-bar"></div>
          </div>
        </div>
      )}

      {!loading && Object.keys(results).length > 0 && (
        <div className="analysis-content">
          <div className="main-analysis">
            {(analysisType === 'statistical' || analysisType === 'all') && renderStatisticalAnalysis()}
            {(analysisType === 'correlation' || analysisType === 'all') && renderCorrelationAnalysis()}
            {(analysisType === 'trend' || analysisType === 'all') && renderTrendAnalysis()}
            {(analysisType === 'outliers' || analysisType === 'all') && renderOutlierDetection()}
            {(analysisType === 'clustering' || analysisType === 'all') && renderClusteringAnalysis()}
            {(analysisType === 'quality' || analysisType === 'all') && renderQualityAssessment()}
          </div>
          
          <div className="analysis-sidebar">
            <div className="export-section">
              <h4>📤 Export Results</h4>
              <div className="export-options">
                <button className="export-btn" onClick={() => exportResults('json')}>
                  <span>📄</span>
                  Export as JSON
                </button>
                <button className="export-btn" onClick={() => exportResults('csv')}>
                  <span>📊</span>
                  Export as CSV
                </button>
                <button className="export-btn" onClick={() => exportResults('pdf')}>
                  <span>📋</span>
                  Generate Report
                </button>
              </div>
            </div>
            
            <div className="analysis-section">
              <h3>📈 Quick Stats</h3>
              <div style={{ fontSize: '14px', color: '#4a5568' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Dataset:</strong> {data.length.toLocaleString()} rows
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Columns:</strong> {Object.keys(data[0] || {}).length}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Selected:</strong> {selectedColumns.length} columns
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Analysis:</strong> {analysisType}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeepAnalysis;
