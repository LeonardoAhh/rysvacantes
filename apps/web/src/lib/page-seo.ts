import { getSeoMeta, getStructuredData } from "./seo"

export function syncPageSeo(path: string, hasError = false) {
  const { page, meta, canonical } = getSeoMeta(path, hasError)
  document.title = page.title
  document.documentElement.lang = "es-MX"

  // Only manage this site's metadata. Remove stale social tags on private/error pages.
  document
    .querySelectorAll(
      "meta[data-site-seo], link[data-site-seo], script[data-site-seo]"
    )
    .forEach((element) => element.remove())
  document
    .querySelectorAll(
      'meta[name="description"], meta[name="robots"], link[rel="canonical"]'
    )
    .forEach((element) => element.remove())
  for (const { attribute, key, content } of meta) {
    const element = document.createElement("meta")
    element.setAttribute(attribute, key)
    element.content = content
    element.dataset.siteSeo = "true"
    document.head.append(element)
  }
  if (canonical) {
    const link = document.createElement("link")
    link.rel = "canonical"
    link.href = canonical
    link.dataset.siteSeo = "true"
    document.head.append(link)
  }
  const data = getStructuredData(path, hasError)
  if (data) {
    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.dataset.siteSeo = "true"
    script.textContent = JSON.stringify(data)
    document.head.append(script)
  }
}
