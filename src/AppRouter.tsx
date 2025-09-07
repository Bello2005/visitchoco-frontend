import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy loading de componentes
const Login = lazy(() => import("./pages/Login/Login"));
const Register = lazy(() => import("./pages/Register/Register"));
const Map = lazy(() => import("./pages/Map/Map"));
const Animals = lazy(() => import("./pages/Animals/Animals"));
const Tourism = lazy(() => import("./pages/Tourism/Tourism"));
const Festival = lazy(() => import("./pages/Festival/Festival"));
const Landing = lazy(() => import("./pages/Landing/Landing"));
const AdminDashboard = lazy(() => import("./pages/Dashboard/AdminDashboard"));
const UserDashboard = lazy(() => import("./pages/Dashboard/UserDashboard"));

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
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
