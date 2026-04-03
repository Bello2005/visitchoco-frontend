import "../../styles/Landing/Landing.css";
import { useNavigate } from "react-router-dom";
import { MainNav } from "../../components/landing/MainNav";
import { FaunaHero } from "../../components/fauna/FaunaHero";
import { BiodiversityStrip } from "../../components/fauna/BiodiversityStrip";
import { BallenasFeature } from "../../components/fauna/BallenasFeature";
import { EspeciesGrid } from "../../components/fauna/EspeciesGrid";
import { ParquesNaturalesSection } from "../../components/fauna/ParquesNaturalesSection";
import { TemporadasFaunaSection } from "../../components/fauna/TemporadasFaunaSection";
import { FaunaFooter } from "../../components/fauna/FaunaFooter";

export default function Fauna() {
  const navigate = useNavigate();

  return (
    <div className="fauna-bg min-h-screen bg-[#010d05] font-sans text-[rgba(255,255,255,0.9)]">
      <MainNav active="animales" onLogin={() => navigate("/login")} />
      <main className="relative z-10 pb-20 md:pb-0">
        <FaunaHero />
        <BiodiversityStrip />
        <BallenasFeature />
        <EspeciesGrid />
        <ParquesNaturalesSection />
        <TemporadasFaunaSection />
        <FaunaFooter />
      </main>
    </div>
  );
}
