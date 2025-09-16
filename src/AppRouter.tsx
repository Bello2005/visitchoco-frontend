import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Map from "./pages/Map/Map";
import Animals from "./pages/Animals/Animals";
import Tourism from "./pages/Tourism/Tourism";
import Festival from "./pages/Festival/Festival";
import { Landing } from "./pages/Landing/Landing";
import { AdminDashboard } from "./pages/Dashboard/AdminDashboard";
import { UserDashboard } from "./pages/Dashboard/UserDashboard";
import LoadingSpinner from "./components/LoadingSpinner";
import DashboardJosser from "./pages/Dashboard/DashbosrdJosser/DashboardJosser";

const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mapa" element={<Map />} />
        <Route path="/animales" element={<Animals />} />
        <Route path="/turismo" element={<Tourism />} />
        <Route path="/fiesta" element={<Festival />} />
        <Route path="/admin-josser" element={<DashboardJosser />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
