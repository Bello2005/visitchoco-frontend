import React from "react";
import { MainNav } from "../../components/landing/MainNav";
import { FiestaHero } from "./components/FiestaHero";
import { ProximasBanner } from "./components/ProximasBanner";
import { SanPachoFeature } from "./components/SanPachoFeature";
import { CalendarioAnual } from "./components/CalendarioAnual";
import { FiestasGrid } from "./components/FiestasGrid";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { useFiestas } from "../../hooks/useFiestas";

const Festival: React.FC = () => {
  const data = useFiestas();
  return (
    <div className="bg-[#0c0800] min-h-screen pb-20 md:pb-0">
      <MainNav active="fiestas" />
      <FiestaHero />
      <ProximasBanner proximas={data.proximas} loading={data.loading} />
      <SanPachoFeature />
      <CalendarioAnual
        porMes={data.porMes}
        mesActual={data.mesActual}
        MESES={data.MESES}
        loading={data.loading}
      />
      <FiestasGrid fiestas={data.fiestas} loading={data.loading} />
      <LandingFooter />
    </div>
  );
};

export default Festival;
