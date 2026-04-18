import "../../styles/Landing/Landing.css";
import { useNavigate } from "react-router-dom";
import { MainNav } from "../../components/layout/MainNav";
import { HistoriaHero } from "./components/HistoriaHero";
import { LineaTiempo } from "./components/LineaTiempo";
import { CimarronajeSection } from "./components/CimarronajeSection";
import { PersonajesSection } from "./components/PersonajesSection";
import { IndependenciaSection } from "./components/IndependenciaSection";
import { AtratoDerecho } from "./components/AtratoDerecho";
import { LandingFooter } from "../../components/layout/LandingFooter";

export default function Historia() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0f0a00] min-h-screen pb-20 md:pb-0">
      <MainNav active="historia" onLogin={() => navigate("/login")} />
      <HistoriaHero />
      <LineaTiempo />
      <CimarronajeSection />
      <PersonajesSection />
      <IndependenciaSection />
      <AtratoDerecho />
      <LandingFooter />
    </div>
  );
}
