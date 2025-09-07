import { API_BASE_URL } from "../config/api.config";

export interface WeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
}

class WeatherService {
  private static instance: WeatherService;

  private constructor() {}

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/weather/current?lat=${lat}&lon=${lon}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener datos del clima");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw error;
    }
  }

  // Método para obtener la URL del ícono del clima
  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }
}

export const weatherService = WeatherService.getInstance();
