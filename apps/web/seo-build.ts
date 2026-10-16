import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import type { Plugin, ResolvedConfig } from "vite"
import {
  getSeoMeta,
  getStructuredData,
  seoPages,
  seoPublicPaths,
  siteOrigin,
} from "./src/lib/seo.ts"

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!
  )
}

export function renderSeoHead(path: string) {
  const { page, meta, canonical } = getSeoMeta(path)
  const structured = getStructuredData(path)
  return [
    `<title>${escapeHtml(page.title)}</title>`,
    ...meta.map(
      ({ attribute, key, content }) =>
        `<meta data-site-seo="true" ${attribute}="${key}" content="${escapeHtml(content)}" />`
    ),
    ...(canonical
      ? [
          `<link data-site-seo="true" rel="canonical" href="${escapeHtml(canonical)}" />`,
        ]
      : []),
    ...(structured
      ? [
          `<script data-site-seo="true" type="application/ld+json">${JSON.stringify(structured).replace(/</g, "\\u003c")}</script>`,
        ]
      : []),
  ].join("\n    ")
}

function initialContent(path: string) {
  const { page } = getSeoMeta(path)
  const links = seoPublicPaths
    .map((href) => `<a href="${href}">${escapeHtml(seoPages[href]!.label)}</a>`)
    .join(" ")
  return `<div id="root"><main class="seo-initial-content page-container"><h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.description)}</p><nav aria-label="Navegación principal">${links}</nav></main></div>`
}

function routeHtml(template: string, path: string, includeContent: boolean) {
  const html = template.replace(
    /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/,
    `<!-- seo:start -->\n    ${renderSeoHead(path)}\n    <!-- seo:end -->`
  )
  return includeContent
    ? html.replace('<div id="root"></div>', initialContent(path))
    : html
}

export function seoBuild(): Plugin {
  let config: ResolvedConfig
  return {
    name: "vinoplastic-route-seo",
    configResolved(resolved) {
      config = resolved
    },
    transformIndexHtml(html, context) {
      const path =
        new URL(context.originalUrl ?? "/", siteOrigin).pathname.replace(
          /\/+$/,
          ""
        ) || "/"
      return routeHtml(html, path, false)
    },
    async writeBundle() {
      if (config.command !== "build") return
      const directory = resolve(config.root, config.build.outDir)
      const template = await readFile(resolve(directory, "index.html"), "utf8")
      for (const path of [...Object.keys(seoPages), "/404"]) {
        const file = path === "/" ? "index.html" : `${path.slice(1)}.html`
        await writeFile(
          resolve(directory, file),
          routeHtml(template, path, true)
        )
      }
      await writeFile(
        resolve(directory, "robots.txt"),
        `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`
      )
      // No synthetic lastmod dates: deploy time is not content modification time.
      const entries = seoPublicPaths
        .map(
          (path) => `  <url><loc>${new URL(path, siteOrigin).href}</loc></url>`
        )
        .join("\n")
      await writeFile(
        resolve(directory, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
      )
    },
  }
}
