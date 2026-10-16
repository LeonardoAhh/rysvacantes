import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { WhatsAppIcon } from "./whatsapp-icon"

export type ContactPhone = Readonly<{
  number: string
  whatsapp?: string
}>

const PHONE_ROTATION_MS = 4000

function ContactPhoneLink({ number, whatsapp }: ContactPhone) {
  const phoneNumber = number.replace(/[^\d+]/g, "")
  const whatsappNumber = whatsapp?.replace(/\D/g, "")

  if (number.trim().toLowerCase() === "por definir") {
    return <span>{number}</span>
  }

  if (whatsappNumber) {
    return (
      <a
        aria-label={`Abrir WhatsApp con ${number}`}
        className="contact-profile-phone-link"
        href={`https://wa.me/${whatsappNumber}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <WhatsAppIcon className="contact-profile-whatsapp-icon" />
        {number}
      </a>
    )
  }

  return phoneNumber ? (
    <a className="contact-profile-phone-link" href={`tel:${phoneNumber}`}>
      {number}
    </a>
  ) : (
    <span>{number}</span>
  )
}

export function ContactPhoneRow({ phones }: { phones: readonly ContactPhone[] }) {
  const numbers = phones.filter(({ number }) => number.trim() !== "")
  const reduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (reduceMotion || isHovered || isFocused || numbers.length < 2) return

    const interval = window.setInterval(() => {
      if (!document.hidden) {
        setActiveIndex((index) => (index + 1) % numbers.length)
      }
    }, PHONE_ROTATION_MS)

    return () => window.clearInterval(interval)
  }, [isFocused, isHovered, numbers.length, reduceMotion])

  const activePhone = numbers.length ? numbers[activeIndex % numbers.length] : undefined

  return (
    <div className="contact-profile-field contact-profile-phone-field">
      <dt className="contact-profile-label">Teléfono</dt>
      <dd
        className="contact-profile-value contact-profile-phone-list"
        onBlurCapture={() => setIsFocused(false)}
        onFocusCapture={() => setIsFocused(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {reduceMotion && numbers.length ? (
          <span className="contact-profile-phone-static-list">
            {numbers.map((phone, index) => (
              <span className="contact-profile-phone-item" key={`${phone.number}-${index}`}>
                <ContactPhoneLink {...phone} />
              </span>
            ))}
          </span>
        ) : activePhone ? (
          <span className="contact-profile-phone-viewport">
            <AnimatePresence initial={false}>
              <motion.span
                animate={{ opacity: 1, y: "0%" }}
                className="contact-profile-phone-item"
                exit={{ opacity: 0, y: "-100%" }}
                initial={{ opacity: 0, y: "100%" }}
                key={`${activePhone.number}-${activeIndex}`}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              >
                <ContactPhoneLink {...activePhone} />
              </motion.span>
            </AnimatePresence>
          </span>
        ) : (
          <span>Por definir</span>
        )}
      </dd>
    </div>
  )
}
