import React from 'react';
import { AuthProvider } from './context/AuthContext';
import DeepfakeDetectionAgent from './DeepfakeDetectionAgent';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <DeepfakeDetectionAgent />
      </div>
    </AuthProvider>
  );
}

export default App;