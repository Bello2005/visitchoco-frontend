import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing/Landing";
import { Login } from "./pages/Login/Login";
import { AdminDashboard } from "./pages/Dashboard/AdminDashboard/AdminDashboard";
import { UserDashboard } from "./pages/Dashboard/UserDashboard/UserDashboard";
import Register from "./pages/Register/Register";
import Map from "./pages/Map/Map";
import Animals from "./pages/Animals/Animals";
import Tourism from "./pages/Tourism/Tourism";
import Festival from "./pages/Festival/Festival";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/mapa" element={<Map />} />
        <Route path="/animales" element={<Animals />} />
        <Route path="/turismo" element={<Tourism />} />
        <Route path="/fiesta" element={<Festival />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
