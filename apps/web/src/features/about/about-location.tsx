import { ArrowUpRight, MapPin } from "lucide-react"
import {
  companyAddress,
  companyMapEmbedUrl,
  companyMapUrl,
} from "@/lib/company-location"
import { AboutReveal } from "./about-reveal"
import "./about-location.css"

export function AboutLocation() {
  return (
    <section
      aria-labelledby="about-location-title"
      className="about-location page-container"
      id="location"
    >
      <AboutReveal className="about-location-heading">
        <div>
          <p className="about-eyebrow">Nuestra ubicación</p>
          <h2 id="about-location-title" tabIndex={-1}>
            Encuéntranos en Querétaro
          </h2>
        </div>
        <p>
          <MapPin aria-hidden="true" />
          <span className="about-location-address">{companyAddress}</span>
        </p>
      </AboutReveal>

      <AboutReveal className="about-location-frame">
        <div aria-hidden="true" className="about-location-frame-bar">
          <span className="about-location-frame-dots">
            <span />
            <span />
            <span />
          </span>
          <span>ViñoPlastic · Querétaro</span>
        </div>
        <iframe
          className="about-location-map"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          src={companyMapEmbedUrl}
          title="Mapa de ViñoPlastic en el Parque Industrial Querétaro"
        />
        <div className="about-location-frame-footer">
          <span>Parque Industrial Querétaro</span>
          <a href={companyMapUrl} rel="noopener noreferrer" target="_blank">
            Abrir en Google Maps
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </AboutReveal>
    </section>
  )
}
