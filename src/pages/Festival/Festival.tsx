import "../../styles/Landing/Landing.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import { MainNav } from "../../components/layout/MainNav";
import { FiestaHero } from "./components/FiestaHero";
import { SanPachoFeature } from "./components/SanPachoFeature";
import { CalendarioAnual } from "./components/CalendarioAnual";
import { FiestasGrid } from "./components/FiestasGrid";
import { ElementosCulturales } from "./components/ElementosCulturales";
import { FiestaFooter } from "./components/FiestaFooter";

const Festival: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0c0800] pb-20 font-sans md:pb-0">
      <MainNav active="fiestas" onLogin={() => navigate("/login")} />
      <FiestaHero />
      <SanPachoFeature />
      <CalendarioAnual />
      <FiestasGrid />
      <ElementosCulturales />
      <FiestaFooter />
    </div>
  );
};

export default Festival;
