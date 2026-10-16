import { ArrowLeft } from "lucide-react"
import { PageBackground } from "@workspace/ui/components/page-background"
import { ContactProfileCard } from "@/components/profile/contact-profile-card"
import { LandingHeader } from "@/features/landing/landing-header"
import { routes } from "@/lib/routes"
import { companyAddress } from "@/lib/company-location"
import "@/features/landing/landing.css"
import "./contact.css"

export function ContactPage() {
  return (
    <div className="site-page contact-page">
      <PageBackground />
      <a className="skip-link" href="#contact-content">
        Saltar al contenido
      </a>
      <LandingHeader currentPage="contact" />
      <main className="contact-main" id="contact-content" tabIndex={-1}>
        <section
          aria-labelledby="contact-title"
          className="contact-layout page-container"
        >
          <div className="contact-intro">
            <p className="contact-eyebrow">ViñoPlastic</p>
            <h1 id="contact-title">Contacto</h1>
            <p className="contact-description">
              Contáctanos para pedir información sobre nuestras vacantes.
            </p>
            <a className="contact-back-link" href={routes.home}>
              <ArrowLeft aria-hidden="true" />
              Volver al inicio
            </a>
          </div>
          <ContactProfileCard
            catalogRef="CONTACTO / VIÑOPLASTIC"
            email="reclutamientoqro@vinoplastic.com.mx"
            location={companyAddress}
            name="Departamento de Reclutamiento"
            phones={[
              { number: "442 509 5534", whatsapp: "5214425095534" },
              { number: "55 1525 4782", whatsapp: "5215515254782" },
            ]}
            title="Información de contacto"
          />
        </section>
      </main>
    </div>
  )
}
