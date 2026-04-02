import React from "react";
import { useNavigate } from "react-router-dom";
import { MainNav } from "../../components/landing/MainNav";
import { FiestaHero } from "../../components/fiesta/FiestaHero";
import { SanPachoFeature } from "../../components/fiesta/SanPachoFeature";
import { CalendarioAnual } from "../../components/fiesta/CalendarioAnual";
import { FiestasGrid } from "../../components/fiesta/FiestasGrid";
import { ElementosCulturales } from "../../components/fiesta/ElementosCulturales";
import { FiestaFooter } from "../../components/fiesta/FiestaFooter";

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
