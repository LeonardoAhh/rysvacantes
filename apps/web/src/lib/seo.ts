import { publicSiteRoutes, routes } from "./routes.ts"
import { companyLocation } from "./company-location.ts"

export const siteOrigin = "https://www.vinoplasticrys.lat"
export const socialImage = `${siteOrigin}/social-preview.png`

export type SeoPage = {
  title: string
  description: string
  heading: string
  label: string
  indexable: boolean
}

export const seoPages: Record<string, SeoPage> = {
  [routes.home]: {
    title: "Vacantes y reclutamiento en Querétaro | ViñoPlastic",
    description:
      "Conoce las vacantes de ViñoPlastic en Querétaro. Consulta sueldos, turnos, prestaciones y rutas de transporte, y contacta a Reclutamiento.",
    heading: "El talento indicado. El futuro en marcha.",
    label: "Inicio",
    indexable: true,
  },
  [routes.vacancies]: {
    title: "Vacantes disponibles en Querétaro | ViñoPlastic",
    description:
      "Consulta las vacantes publicadas de ViñoPlastic: puestos, sueldo bruto, turnos, horarios y prestaciones. Pide información a nuestro equipo de Reclutamiento.",
    heading: "Vacantes disponibles",
    label: "Vacantes",
    indexable: true,
  },
  [routes.about]: {
    title: "Conoce ViñoPlastic: empresa y procesos | Querétaro",
    description:
      "Conoce ViñoPlastic, sus procesos de inyección de plástico, servicios, productos y valores. Encuentra nuestra ubicación en el Parque Industrial Querétaro.",
    heading: "Conócenos",
    label: "Empresa",
    indexable: true,
  },
  [routes.contact]: {
    title: "Contacto de Reclutamiento en Querétaro | ViñoPlastic",
    description:
      "Contacta al Departamento de Reclutamiento de ViñoPlastic por WhatsApp o correo. Consulta nuestra dirección en el Parque Industrial Querétaro.",
    heading: "Contacto",
    label: "Contacto",
    indexable: true,
  },
  [routes.transport]: {
    title: "Rutas de transporte: paradas y horarios | ViñoPlastic",
    description:
      "Consulta las rutas de transporte de ViñoPlastic, sus paradas y horarios por turno en Querétaro y San José Iturbide. Confirma disponibilidad con Reclutamiento.",
    heading: "Rutas de transporte",
    label: "Transporte",
    indexable: true,
  },
  [routes.auth]: {
    title: "Iniciar sesión | ViñoPlastic Administración",
    description:
      "Acceso al panel de administración de ViñoPlastic para cuentas autorizadas.",
    heading: "Iniciar sesión",
    label: "Administración",
    indexable: false,
  },
  [routes.dashboard]: {
    title: "Panel de vacantes | ViñoPlastic Administración",
    description: "Gestión de vacantes de ViñoPlastic para cuentas autorizadas.",
    heading: "Gestión de vacantes",
    label: "Administración",
    indexable: false,
  },
}

export function getSeoPage(path: string, hasError = false): SeoPage {
  if (hasError)
    return {
      title: "No pudimos abrir esta página | ViñoPlastic",
      description:
        "Vuelve a intentarlo para consultar la información de ViñoPlastic.",
      heading: "No pudimos abrir esta página",
      label: "Error",
      indexable: false,
    }
  return (
    seoPages[path] ?? {
      title: "Página no encontrada | ViñoPlastic",
      description:
        "La dirección que buscas no existe. Visita el inicio para consultar las vacantes de ViñoPlastic.",
      heading: "Página no encontrada",
      label: "Página no encontrada",
      indexable: false,
    }
  )
}

export function getSeoMeta(path: string, hasError = false) {
  const page = getSeoPage(path, hasError)
  const url = new URL(path, siteOrigin).href
  const meta: {
    attribute: "name" | "property"
    key: string
    content: string
  }[] = [
    { attribute: "name", key: "description", content: page.description },
    {
      attribute: "name",
      key: "robots",
      content: page.indexable
        ? "index, follow, max-image-preview:large"
        : "noindex, nofollow",
    },
  ]
  if (page.indexable) {
    meta.push(
      { attribute: "property", key: "og:type", content: "website" },
      {
        attribute: "property",
        key: "og:site_name",
        content: "ViñoPlastic Reclutamiento",
      },
      { attribute: "property", key: "og:locale", content: "es_MX" },
      { attribute: "property", key: "og:title", content: page.title },
      {
        attribute: "property",
        key: "og:description",
        content: page.description,
      },
      { attribute: "property", key: "og:url", content: url },
      { attribute: "property", key: "og:image", content: socialImage },
      { attribute: "property", key: "og:image:width", content: "1200" },
      { attribute: "property", key: "og:image:height", content: "630" },
      {
        attribute: "property",
        key: "og:image:alt",
        content: "ViñoPlastic: vacantes y reclutamiento en Querétaro",
      },
      {
        attribute: "name",
        key: "twitter:card",
        content: "summary_large_image",
      },
      { attribute: "name", key: "twitter:title", content: page.title },
      {
        attribute: "name",
        key: "twitter:description",
        content: page.description,
      },
      { attribute: "name", key: "twitter:image", content: socialImage },
      {
        attribute: "name",
        key: "twitter:image:alt",
        content: "ViñoPlastic: vacantes y reclutamiento en Querétaro",
      }
    )
  }
  return { page, meta, canonical: page.indexable ? url : null }
}

export function getStructuredData(path: string, hasError = false) {
  const page = getSeoPage(path, hasError)
  if (!page.indexable) return null
  const url = new URL(path, siteOrigin).href
  const organization = `${siteOrigin}/#organization`
  const website = `${siteOrigin}/#website`
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organization,
        name: "ViñoPlastic",
        url: `${siteOrigin}/`,
        logo: `${siteOrigin}/icon-512.png`,
        address: {
          "@type": "PostalAddress",
          streetAddress: `${companyLocation.street}, ${companyLocation.industrialPark}`,
          addressLocality: companyLocation.locality,
          addressRegion: companyLocation.state,
          postalCode: companyLocation.postalCode,
          addressCountry: "MX",
        },
      },
      {
        "@type": "WebSite",
        "@id": website,
        url: `${siteOrigin}/`,
        name: "ViñoPlastic Reclutamiento",
        inLanguage: "es-MX",
        publisher: { "@id": organization },
      },
      {
        "@type":
          path === routes.vacancies
            ? "CollectionPage"
            : path === routes.about
              ? "AboutPage"
              : path === routes.contact
                ? "ContactPage"
                : "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: "es-MX",
        isPartOf: { "@id": website },
        about: { "@id": organization },
      },
      ...(path === routes.home
        ? []
        : [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Inicio",
                  item: `${siteOrigin}/`,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: page.label,
                  item: url,
                },
              ],
            },
          ]),
    ],
  }
}

export const seoPublicPaths = publicSiteRoutes.filter(
  (path) => seoPages[path]?.indexable
)
