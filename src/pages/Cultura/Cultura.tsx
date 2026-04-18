import "../../styles/Landing/Landing.css";
import { MainNav } from "../../components/layout/MainNav";
import { CulturaHero } from "./components/CulturaHero";
import { PESSection } from "./components/PESSection";
import { GastronomiaSection } from "./components/GastronomiaSection";
import { ExpresionesSection } from "./components/ExpresionesSection";
import { ChirimiaSection } from "./components/ChirimiaSection";
import { LandingFooter } from "../../components/layout/LandingFooter";

export default function Cultura() {
  return (
    <div className="bg-[#0a0f0a] min-h-screen pb-20 md:pb-0">
      <MainNav active="cultura" />
      <CulturaHero />
      <PESSection />
      <ChirimiaSection />
      <ExpresionesSection />
      <GastronomiaSection />
      <LandingFooter />
    </div>
  );
}
