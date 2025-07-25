// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing/Landing";
import { Login } from "./pages/Login/Login";
import { AdminDashboard } from "./pages/Dashboard/AdminDashboard/AdminDashboard";
import { Register } from "./pages/Register/Register";
import { UserDashboard } from "./pages/Dashboard/UserDashboard/UserDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/register" element={<Register />} />
      <Route path="/user/dashboard" element={<UserDashboard />} />
    </Routes>
  );
}

export default App;
