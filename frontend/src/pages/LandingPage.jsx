import "../landing/styles/tokens.css";
import "../landing/styles/base.css";

import { Footer } from "../landing/components/Footer.jsx";
import { HeroSection } from "../landing/components/HeroSection.jsx";
import { MultimodalAnalysis } from "../landing/components/MultimodalAnalysis.jsx";
import { Navbar } from "../landing/components/Navbar.jsx";
import { ProcessSummary } from "../landing/components/ProcessSummary.jsx";
import { ReportSection } from "../landing/components/ReportSection.jsx";
import { ResponsibleUseSection } from "../landing/components/ResponsibleUseSection.jsx";

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <a className="skip-link" href="#contenido">
        Saltar al contenido principal
      </a>

      <Navbar />

      <main id="contenido">
        <HeroSection />
        <ProcessSummary />
        <MultimodalAnalysis />
        <ReportSection />
        <ResponsibleUseSection />
      </main>

      <Footer />
    </div>
  );
}
