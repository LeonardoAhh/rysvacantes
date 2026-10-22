import { motion, useReducedMotion } from "motion/react"
import { ArrowRight, ArrowUpRight, Check, Sparkles } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import { routes } from "@/lib/routes"

const motionTransition = { duration: 0.3, ease: "easeOut" as const }

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      aria-labelledby="hero-title"
      className="hero-section page-container"
    >
      <div className="hero-copy" id="companies">
        <motion.div
          animate={{ opacity: 1 }}
          className="hero-copy-content"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          transition={motionTransition}
        >
          <p className="eyebrow">Trabaja con nosotros</p>
          <h1 id="hero-title">
            Trabaja en{" "}
            <span>ViñoPlastic.</span>
          </h1>
          <p className="hero-description" id="talent">
            Explora las vacantes y conoce sueldo, ubicación, horario y requisitos
            antes de escribir a Reclutamiento.
          </p>
          <div className="hero-actions">
            <a
              className={`${buttonVariants({ size: "lg" })} landing-primary-cta`}
              href={routes.vacancies}
            >
              Ver vacantes
              <ArrowRight aria-hidden="true" />
            </a>
            <a
              aria-label="Conoce la empresa"
              className="text-link"
              href={routes.about}
            >
              Empresa
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
          <div className="hero-note">
            <span aria-hidden="true" className="note-check">
              <Check />
            </span>
            <p>
              <strong>Personas primero.</strong> Relaciones que impulsan
              resultados.
            </p>
          </div>
        </motion.div>
        <div aria-hidden="true" className="hero-index">
          <span>01</span>
          <span className="hero-index-line" />
          <span>02</span>
        </div>
      </div>

      <motion.aside
        aria-label="Conexión entre vacantes y talento"
        className="hero-visual"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        transition={{
          ...motionTransition,
          delay: shouldReduceMotion ? 0 : 0.08,
        }}
        animate={{ opacity: 1 }}
      >
        <div aria-hidden="true" className="visual-sun" />
        <div aria-hidden="true" className="visual-orbit visual-orbit-one" />
        <div aria-hidden="true" className="visual-orbit visual-orbit-two" />

        <div className="visual-caption">
          <span className="caption-dot" />
          PERSONAS + OPORTUNIDADES
        </div>

        <div className="connection-card">
          <div className="connection-card-top">
            <span className="card-kicker">EL SIGUIENTE PASO</span>
            <span aria-hidden="true" className="card-arrow">
              <ArrowUpRight />
            </span>
          </div>
          <div aria-hidden="true" className="portrait-art">
            <span className="portrait-halo" />
            <span className="portrait-head" />
            <span className="portrait-body" />
            <span className="portrait-leaf portrait-leaf-one" />
            <span className="portrait-leaf portrait-leaf-two" />
          </div>
          <div className="connection-card-copy">
            <span className="card-kicker">UN ENCUENTRO QUE SUMA</span>
            <h2>El lugar donde el talento florece.</h2>
            <p>Selección cercana, estratégica y hecha para crecer.</p>
          </div>
          <div aria-hidden="true" className="connection-card-footer">
            <span>CONEXIONES CON PROPÓSITO</span>
            <span className="footer-sparkle">
              <Sparkles />
            </span>
          </div>
        </div>

        <div aria-hidden="true" className="floating-note floating-note-top">
          <span className="floating-note-icon">
            <Sparkles />
          </span>
          <span>
            <strong>Más que cubrir vacantes</strong>
            <small>Compartimos valores</small>
          </span>
        </div>
        <div aria-hidden="true" className="floating-note floating-note-bottom">
          <span className="mini-avatars">
            <i>N</i>
            <i>+</i>
          </span>
          <span>
            <strong>Personas que conectan</strong>
            <small>Equipos que evolucionan</small>
          </span>
        </div>
      </motion.aside>
    </section>
  )
}
