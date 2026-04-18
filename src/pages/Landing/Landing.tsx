import { MainNav } from "../../components/layout/MainNav";
import { HeroSection } from "./components/HeroSection";
import { StatsStrip } from "./components/StatsStrip";
import { ExploreGrid } from "./components/ExploreGrid";
import { TerritorioSection } from "./components/TerritorioSection";
import { PatrimonioSection } from "./components/PatrimonioSection";
import { MunicipiosCarousel } from "./components/MunicipiosCarousel";
import { LandingFooter } from "../../components/layout/LandingFooter";

const Landing = () => (
  <div className="bg-black pb-20 md:pb-0">
    <MainNav />
    <HeroSection />
    <StatsStrip />
    <ExploreGrid />
    <TerritorioSection />
    <PatrimonioSection />
    <MunicipiosCarousel />
    <LandingFooter />
  </div>
);

export { Landing };
