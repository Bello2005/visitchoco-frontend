import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing/Landing";
import { AccentProvider } from "./providers/AccentProvider";
import LoadingSpinner from "./components/LoadingSpinner";
import { EmergencyBanner } from "./components/layout/EmergencyBanner";
import { PrivateRoute } from "./components/common/PrivateRoute";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import MundoLoader from "./pages/Mundo/components/MundoLoader";

// El inicio viene en el paquete principal; cada otra página se baja solo cuando alguien entra a ella.
// Antes todas iban juntas: quien abría el inicio descargaba también los paneles, el mapa con Leaflet
// y la animación Lottie del 404.
const Login = lazy(() => import("./pages/Login/Login").then((m) => ({ default: m.Login })));
const Register = lazy(() => import("./pages/Register/Register"));
const Map = lazy(() => import("./pages/Map/Map"));
const Fauna = lazy(() => import("./pages/Fauna/Fauna"));
const Tourism = lazy(() => import("./pages/Tourism/Tourism"));
const Festival = lazy(() => import("./pages/Festival/Festival"));
const Cultura = lazy(() => import("./pages/Cultura/Cultura"));
const Historia = lazy(() => import("./pages/Historia/Historia"));
const Acerca = lazy(() => import("./pages/Acerca/Acerca"));
const Fuentes = lazy(() => import("./pages/Fuentes/Fuentes"));
const AtratoPage = lazy(() => import("./pages/Atrato/Atrato"));
const Directorio = lazy(() => import("./pages/Directorio/Directorio"));
const Negocio = lazy(() => import("./pages/Negocio/Negocio"));
const Sismo = lazy(() => import("./pages/Sismo/Sismo"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound").then((m) => ({ default: m.NotFound })));
const AdminDashboard = lazy(() =>
  import("./pages/Dashboard/AdminDashboard/AdminDashboard").then((m) => ({ default: m.AdminDashboard })),
);
const UserDashboard = lazy(() =>
  import("./pages/Dashboard/UserDashboard/UserDashboard").then((m) => ({ default: m.UserDashboard })),
);
const Mundo = lazy(() => import("./pages/Mundo/Mundo"));

/**
 * Mientras llega el código de una página. Si llega rápido (lo normal), no se ve nada: el aviso solo
 * aparece pasados 400 ms, para no hacer parpadear la pantalla en cada clic.
 */
function CargandoPagina() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(id);
  }, []);
  return visible ? <LoadingSpinner /> : <div style={{ minHeight: "100dvh" }} />;
}

function AppContent() {
  return (
    <AccentProvider>
    <ErrorBoundary>
        <EmergencyBanner />
        <Suspense fallback={<CargandoPagina />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mapa" element={<Map />} />
          <Route path="/animales" element={<Fauna />} />
          <Route path="/turismo" element={<Tourism />} />
          <Route path="/cultura" element={<Cultura />} />
          <Route path="/historia" element={<Historia />} />
          <Route path="/acerca" element={<Acerca />} />
          <Route path="/fuentes" element={<Fuentes />} />
          <Route path="/fiesta" element={<Festival />} />
          <Route path="/fiestas" element={<Festival />} />
          <Route path="/atrato" element={<AtratoPage />} />
          <Route path="/directorio" element={<Directorio />} />
          <Route path="/negocio/:slug" element={<Negocio />} />
          <Route path="/sismo" element={<Sismo />} />
          <Route
            path="/mundo"
            element={
              <Suspense fallback={<MundoLoader fading={false} />}>
                <Mundo />
              </Suspense>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/dashboard"
            element={
              <PrivateRoute requiredRole="user">
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
    </ErrorBoundary>
    </AccentProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
