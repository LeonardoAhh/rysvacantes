import { forwardRef, type ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"
import "./contact-profile-card.css"

type ContactField = Readonly<{
  label: string
  value: string
  href?: string
}>

export type ContactProfileCardProps = Readonly<
  {
    name?: string
    title?: string
    email?: string
    phone?: string
    phones?: readonly string[]
    location?: string
    website?: string
    websiteHref?: string
    catalogRef?: string
  } & ComponentPropsWithoutRef<"article">
>

function isPending(value: string) {
  return value.trim().toLowerCase() === "por definir"
}

function ContactFieldRow({ label, value, href }: ContactField) {
  return (
    <div className="contact-profile-field">
      <dt className="contact-profile-label">{label}</dt>
      <dd className="contact-profile-value">
        {href && !isPending(value) ? (
          <a href={href}>{value}</a>
        ) : (
          <span>{value}</span>
        )}
      </dd>
    </div>
  )
}

function ContactPhoneRow({ phones }: { phones: readonly string[] }) {
  const numbers = phones.filter((phone) => phone.trim() !== "")

  return (
    <div className="contact-profile-field">
      <dt className="contact-profile-label">Teléfono</dt>
      <dd className="contact-profile-value contact-profile-phone-list">
        {numbers.map((phone, index) => {
          const phoneNumber = phone.replace(/[^\d+]/g, "")
          const phoneHref =
            !isPending(phone) && phoneNumber ? `tel:${phoneNumber}` : undefined

          return (
            <span className="contact-profile-phone-item" key={`${phone}-${index}`}>
              {phoneHref ? <a href={phoneHref}>{phone}</a> : <span>{phone}</span>}
            </span>
          )
        })}
      </dd>
    </div>
  )
}

export const ContactProfileCard = forwardRef<
  HTMLElement,
  ContactProfileCardProps
>(
  (
    {
      className,
      name = "Por definir",
      title = "Información de contacto",
      email = "Por definir",
      phone = "Por definir",
      phones,
      location = "Por definir",
      website,
      websiteHref,
      catalogRef = "CONTACTO / VIÑOPLASTIC",
      ...props
    },
    ref
  ) => {
    const emailHref = !isPending(email) ? `mailto:${email}` : undefined
    const contactPhones = phones ?? [phone]

    return (
      <article
        ref={ref}
        aria-label="Perfil de contacto"
        data-slot="contact-profile-card"
        className={cn("contact-profile-card", className)}
        {...props}
      >
        <p className="contact-profile-reference">{catalogRef}</p>
        <h2 className="contact-profile-name">{name}</h2>
        <p className="contact-profile-title">{title}</p>

        <dl className="contact-profile-fields">
          <ContactFieldRow
            label="Correo"
            value={email}
            href={emailHref}
          />
          <ContactPhoneRow phones={contactPhones} />
          <ContactFieldRow label="Ubicación" value={location} />
          {website ? (
            <ContactFieldRow
              label="Sitio web"
              value={website}
              href={websiteHref}
            />
          ) : null}
        </dl>
      </article>
    )
  }
)

ContactProfileCard.displayName = "ContactProfileCard"
