import { getSeoPage } from "./seo"

export function getPageTitle(path: string, hasError = false) {
  return getSeoPage(path, hasError).title
}
