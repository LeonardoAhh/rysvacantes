import { Fragment } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"

export type SiteBreadcrumbItem = {
  label: string
  href?: string
}

export function SiteBreadcrumb({
  items,
}: {
  items: readonly SiteBreadcrumbItem[]
}) {
  return (
    <Breadcrumb className="site-header-breadcrumb">
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={item.href ?? item.label}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
