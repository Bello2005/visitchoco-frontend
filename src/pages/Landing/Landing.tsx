import { MainNav } from "../../components/landing/MainNav";
import { HeroSection } from "../../components/landing/HeroSection";
import { StatsStrip } from "../../components/landing/StatsStrip";
import { ExploreGrid } from "../../components/landing/ExploreGrid";
import { TerritorioSection } from "../../components/landing/TerritorioSection";
import { PatrimonioSection } from "../../components/landing/PatrimonioSection";
import { MunicipiosCarousel } from "../../components/landing/MunicipiosCarousel";
import { LandingFooter } from "../../components/landing/LandingFooter";

const Landing = () => (
  <div className="bg-white pb-20 md:pb-0">
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
