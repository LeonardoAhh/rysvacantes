import { PageBackground } from "@workspace/ui/components/page-background"
import { LandingHeader } from "@/features/landing/landing-header"
import { AboutScrollProgress } from "./about-scroll-progress"
import { AboutPageNavigation } from "./about-page-navigation"
import { AboutLocation } from "./about-location"
import {
  AboutIntroduction,
  AboutProducts,
  AboutPurpose,
  AboutQuality,
  AboutServices,
} from "./about-sections"
import "@/features/landing/landing.css"
import "./about.css"

export function AboutPage() {
  return (
    <div className="site-page about-page">
      <PageBackground />
      <AboutScrollProgress />
      <AboutPageNavigation />
      <a className="skip-link" href="#about-content">
        Saltar al contenido
      </a>
      <LandingHeader currentPage="about" />
      <main id="about-content" tabIndex={-1}>
        <AboutIntroduction />
        <AboutServices />
        <AboutPurpose />
        <AboutProducts />
        <AboutQuality />
        <AboutLocation />
      </main>
    </div>
  )
}
