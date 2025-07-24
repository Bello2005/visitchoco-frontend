// src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing/Landing';
import { Login } from './pages/Login/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* add more routes here */}
    </Routes>
  );
}

export default App;
