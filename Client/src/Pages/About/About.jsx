import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <h2>About Excel Analyzer</h2>
      <p>
        Excel Analyzer is a React-based web app that helps you upload Excel files, visualize data, 
        and generate insightful reports with ease. Built with React, Chart.js, and XLSX parser, it’s perfect 
        for quick, interactive data analysis.
      </p>
      <p>
        This project showcases client-side authentication, dynamic charts, and user-friendly UI 
        to empower users to make data-driven decisions.
      </p>
      <p>We hope you find it useful!</p>
    </div>
  );
};

export default About;
