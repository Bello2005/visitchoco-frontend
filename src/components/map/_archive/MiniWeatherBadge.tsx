import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Municipality } from "../../../services/municipality.service";
import type { WeatherData } from "../../../services/weather.service";
import { weatherService } from "../../../services/weather.service";

interface MiniWeatherBadgeProps {
  municipality: Municipality;
  onClick: () => void;
  className?: string;
}

export const MiniWeatherBadge: React.FC<MiniWeatherBadgeProps> = ({
  municipality,
  onClick,
  className = "",
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (!municipality?.lat || !municipality?.lon) return;
    weatherService
      .getCurrentWeather(Number(municipality.lat), Number(municipality.lon))
      .then(setWeatherData)
      .catch(() => setWeatherData(null));
  }, [municipality?.lat, municipality?.lon]);

  return (
    <motion.button
      onClick={onClick}
      className={`absolute bottom-8 left-4 ${className}`}
      style={{ zIndex: 1000 }}
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 10, opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        }}
      >
        {weatherData?.weather?.[0]?.icon ? (
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
            alt={weatherData.weather[0].description}
            className="w-8 h-8"
          />
        ) : (
          <span className="text-xl">🌤️</span>
        )}
        <div className="text-left">
          <p className="text-xs font-semibold text-gray-800 leading-none">
            {municipality.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {weatherData?.main
              ? `${Math.round(weatherData.main.temp)}°C · ${weatherData.weather?.[0]?.description ?? ""}`
              : "Ver información"}
          </p>
        </div>
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  );
};
