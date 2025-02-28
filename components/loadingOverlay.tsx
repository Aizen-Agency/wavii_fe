import React from 'react';
import './styles.css';

const LoadingOverlay: React.FC = () => (
  <div className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="loader"></div>
  </div>
);

export default LoadingOverlay;
