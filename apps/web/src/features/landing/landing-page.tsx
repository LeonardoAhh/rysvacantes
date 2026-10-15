import { PageBackground } from "@workspace/ui/components/page-background"
import { LandingHeader } from "./landing-header"
import { HeroSection } from "./hero-section"
import "./landing.css"

export function LandingPage() {
  return (
    <div className="site-page landing-page" id="home">
      <PageBackground variant="subtle" />
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <LandingHeader currentPage="home" />
      <main className="landing-main" id="main-content" tabIndex={-1}>
        <HeroSection />
      </main>
    </div>
  )
}
