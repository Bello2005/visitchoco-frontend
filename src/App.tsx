import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Landing } from "./pages/Landing/Landing";
import { Login } from "./pages/Login/Login";
import { AdminDashboard } from "./pages/Dashboard/AdminDashboard/AdminDashboard";
import { UserDashboard } from "./pages/Dashboard/UserDashboard/UserDashboard";
import Register from "./pages/Register/Register";
import Map from "./pages/Map/Map";
import Animals from "./pages/Animals/Animals";
import Tourism from "./pages/Tourism/Tourism";
import Festival from "./pages/Festival/Festival";
import LoadingSpinner from "./components/LoadingSpinner";
import { NotFound } from "./pages/NotFound/NotFound";

function AppContent() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkLoadingStatus = async () => {
      // Esperar a que el DOM esté listo
      if (document.readyState !== "complete") {
        return false;
      }

      // Esperar a que todas las imágenes estén cargadas
      const images = Array.from(document.images);
      const imagePromises = images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = img.onerror = resolve;
        });
      });

      // Esperar a que todos los vídeos estén cargados
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
        return true; // En caso de error, asumimos que la carga está completa
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

    // Iniciar el proceso de carga
    initializeLoading();

    // Configurar los listeners para cambios en el estado de carga
    window.addEventListener("load", handleContentLoad);
    document.addEventListener("readystatechange", handleContentLoad);

    // Timeout de seguridad (3 segundos)
    timeoutId = setTimeout(() => {
      if (mounted) {
        setIsLoading(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener("load", handleContentLoad);
      document.removeEventListener("readystatechange", handleContentLoad);
    };
    timeoutId = setTimeout(() => {
      if (mounted) {
        setIsLoading(false);
      }
    }, 2000);

    // Limpiar los listeners y el estado
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener("load", handleLoadComplete);
      document.removeEventListener("readystatechange", handleLoadingState);
    };
  }, [location]);

  return (
    <>
      {isLoading && <LoadingSpinner />}
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
        <Route path="*" element={<NotFound />} />
        <Route path="/animales" element={<Animals />} />
        <Route path="/turismo" element={<Tourism />} />
        <Route path="/fiesta" element={<Festival />} />
      </Routes>
    </>
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
