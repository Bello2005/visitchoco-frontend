import "../../styles/Landing/Landing.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import { MainNav } from "../../components/landing/MainNav";
import { TurismoHero } from "./components/TurismoHero";
import { BallenasFeature } from "./components/BallenasFeature";
import { DestinosGrid } from "./components/DestinosGrid";
import { TemporadasSection } from "./components/TemporadasSection";
import { ExperienciasSection } from "./components/ExperienciasSection";
import { RNTSection } from "./components/RNTSection";
import { LandingFooter } from "../../components/landing/LandingFooter";

const Tourism: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#020d1a] min-h-screen pb-20 md:pb-0">
      <MainNav active="turismo" onLogin={() => navigate("/login")} />
      <TurismoHero />
      <BallenasFeature />
      <DestinosGrid />
      <TemporadasSection />
      <ExperienciasSection />
      <RNTSection />
      <LandingFooter />
    </div>
  );
};

export default Tourism;
