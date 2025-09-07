import { ParticlesBackground } from "../../components/landing/ParticlesBackground";
import { MainNav } from "../../components/landing/MainNav";
import { HeroSection } from "../../components/landing/HeroSection";
import { FeaturesSection } from "../../components/landing/FeaturesSection";
import { GallerySection } from "../../components/landing/GallerySection";
import { TestimonialsSection } from "../../components/landing/TestimonialsSection";
import { FinalCTA } from "../../components/landing/FinalCTA";
import { MainFooter } from "../../components/landing/MainFooter";
import "../../styles/Landing/Landing.css";

const Landing = () => {
  return (
    <div className="landing-page relative">
      <ParticlesBackground />
      <MainNav />
      <HeroSection />
      <div className="relative z-10">
        <FeaturesSection />
      </div>
      <GallerySection />
      <TestimonialsSection />
      <div className="relative z-10">
        <FinalCTA />
      </div>
      <MainFooter />
    </div>
  );
};

export { Landing };
