import { ArrowRight, Check } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import {
  aboutImages,
  qualityBenefits,
  sectors,
  services,
  values,
} from "./about-content"
import { AboutReveal } from "./about-reveal"
import { AboutLogoCarousel } from "./about-logo-carousel"

export function AboutIntroduction() {
  return (
    <section
      aria-labelledby="about-title"
      className="about-intro page-container"
      id="about-intro"
    >
      <AboutReveal className="about-intro-copy">
        <p className="about-eyebrow">Empresa · Desde 1970</p>
        <h1 id="about-title" tabIndex={-1}>
          Conocenos
        </h1>
        <p className="about-lead">
          Transformamos plásticos mediante inyección para atender las
          necesidades de la industria nacional e internacional.
        </p>
        <p className="about-supporting">
          Conoce lo que hacemos, los sectores a los que llegamos y los valores
          que orientan nuestro trabajo.
        </p>
        <div className="about-actions">
          <a
            className={`${buttonVariants({ size: "lg" })} landing-primary-cta`}
            href="#services"
          >
            Explorar la empresa <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </AboutReveal>
      <AboutReveal className="about-hero-image">
        <img
          alt="Imagen corporativa de ViñoPlastic"
          decoding="async"
          fetchPriority="high"
          src={aboutImages.company}
        />
        <span className="about-image-caption">Industria en movimiento</span>
      </AboutReveal>
    </section>
  )
}

export function AboutServices() {
  return (
    <section
      aria-labelledby="services-title"
      className="about-section"
      id="services"
    >
      <div className="page-container about-split">
        <AboutReveal className="about-section-copy">
          <p className="about-eyebrow">Lo que hacemos</p>
          <h2 id="services-title" tabIndex={-1}>
            Capacidad para cada proceso
          </h2>
          <p>
            Nuestro trabajo abarca la inyección de plástico, el decorado, los
            subensambles y el desarrollo de moldes.
          </p>
          <ul className="about-service-list">
            {services.map((service) => (
              <li key={service}>
                <Check aria-hidden="true" />
                <span>{service}</span>
              </li>
            ))}
          </ul>
          <p className="about-detail">
            Para estos procesos se emplean máquinas de inyección, secadores,
            cargadores, montacargas, termorreguladores, enfriadores,
            controladores de colada caliente, molinos y pigmentadoras.
          </p>
        </AboutReveal>
        <AboutReveal className="about-service-image">
          <img
            alt="Imagen de los servicios de ViñoPlastic"
            decoding="async"
            loading="lazy"
            src={aboutImages.services}
          />
        </AboutReveal>
      </div>
    </section>
  )
}

export function AboutPurpose() {
  return (
    <section
      aria-labelledby="purpose-title"
      className="about-section about-purpose"
      id="purpose"
    >
      <div className="page-container">
        <AboutReveal>
          <p className="about-eyebrow">Nuestra dirección</p>
          <h2 id="purpose-title" tabIndex={-1}>
            Lo que nos guía
          </h2>
        </AboutReveal>
        <div className="about-purpose-grid">
          <AboutReveal className="about-purpose-card">
            <span aria-hidden="true" className="about-card-index">
              01
            </span>
            <h3>Misión</h3>
            <p>
              Satisfacer las necesidades de nuestros clientes con excelencia,
              proporcionando soluciones integrales e innovadoras.
            </p>
          </AboutReveal>
          <AboutReveal className="about-purpose-card">
            <span aria-hidden="true" className="about-card-index">
              02
            </span>
            <h3>Visión</h3>
            <p>
              Ser reconocidos como líderes en la inyección de plástico y la
              mejor alternativa para nuestros clientes, con una participación
              creciente.
            </p>
          </AboutReveal>
        </div>
        <AboutReveal className="about-values">
          <h3>Valores</h3>
          <ul>
            {values.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </AboutReveal>
      </div>
    </section>
  )
}

export function AboutProducts() {
  return (
    <section
      aria-labelledby="products-title"
      className="about-section about-products"
      id="products"
    >
      <div className="page-container">
        <AboutReveal className="about-section-heading">
          <div>
            <p className="about-eyebrow">Nuestros productos</p>
            <h2 id="products-title" tabIndex={-1}>
              Piezas para distintas industrias
            </h2>
          </div>
          <p>
            Las piezas de plástico inyectado que producimos se utilizan en
            diversos sectores.
          </p>
        </AboutReveal>
        <AboutReveal>
          <ul className="about-sector-list">
            {sectors.map((sector) => (
              <li key={sector}>{sector}</li>
            ))}
          </ul>
        </AboutReveal>
        <AboutReveal>
          <AboutLogoCarousel />
        </AboutReveal>
      </div>
    </section>
  )
}

export function AboutQuality() {
  return (
    <section
      aria-labelledby="quality-title"
      className="about-section about-quality"
      id="quality"
    >
      <div className="page-container about-quality-grid">
        <AboutReveal>
          <p className="about-eyebrow">Calidad</p>
          <h2 id="quality-title" tabIndex={-1}>
            Procesos orientados a la calidad
          </h2>
          <p>
            Buscamos mejorar nuestros productos y procesos para responder a las
            necesidades de cada proyecto con calidad y eficiencia.
          </p>
        </AboutReveal>
        <AboutReveal className="about-quality-card">
          <h3>Nuestro enfoque</h3>
          <ul>
            {qualityBenefits.map((benefit) => (
              <li key={benefit}>
                <Check aria-hidden="true" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </AboutReveal>
      </div>
    </section>
  )
}
