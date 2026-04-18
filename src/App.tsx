import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Landing } from "./pages/Landing/Landing";
import { Login } from "./pages/Login/Login";
import { AdminDashboard } from "./pages/Dashboard/AdminDashboard/AdminDashboard";
import { UserDashboard } from "./pages/Dashboard/UserDashboard/UserDashboard";
import Register from "./pages/Register/Register";
import Map from "./pages/Map/Map";
import Fauna from "./pages/Fauna/Fauna";
import Tourism from "./pages/Tourism/Tourism";
import Festival from "./pages/Festival/Festival";
import Cultura from "./pages/Cultura/Cultura";
import Historia from "./pages/Historia/Historia";
import Acerca from "./pages/Acerca/Acerca";
import Fuentes from "./pages/Fuentes/Fuentes";
import LoadingSpinner from "./components/LoadingSpinner";
import { NotFound } from "./pages/NotFound/NotFound";
import { PrivateRoute } from "./components/common/PrivateRoute";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

function AppContent() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkLoadingStatus = async () => {
      if (document.readyState !== "complete") {
        return false;
      }

      const images = Array.from(document.images);
      const imagePromises = images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = img.onerror = resolve;
        });
      });

      const videos = Array.from(document.getElementsByTagName("video"));
      const videoPromises = videos.map((video) => {
        if (video.readyState >= 3) return Promise.resolve();
        return new Promise((resolve) => {
          video.oncanplay = resolve;
        });
      });

      try {
        await Promise.all([...imagePromises, ...videoPromises]);
        return true;
      } catch {
        return true;
      }
    };

    const handleContentLoad = async () => {
      if (!mounted) return;
      const isFullyLoaded = await checkLoadingStatus();
      if (mounted && isFullyLoaded) {
        setIsLoading(false);
      }
    };

    const initializeLoading = async () => {
      setIsLoading(true);
      await handleContentLoad();
    };

    initializeLoading();

    window.addEventListener("load", handleContentLoad);
    document.addEventListener("readystatechange", handleContentLoad);

    // Timeout de seguridad (3 segundos)
    timeoutId = setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener("load", handleContentLoad);
      document.removeEventListener("readystatechange", handleContentLoad);
    };
  }, [location]);

  return (
    <ErrorBoundary>
      {isLoading && <LoadingSpinner />}
      <div
        className={`transition-opacity duration-200 ${
          isLoading ? "opacity-0 pointer-events-none select-none" : "opacity-100"
        }`}
        aria-hidden={isLoading}
      >
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
      </div>
    </ErrorBoundary>
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
