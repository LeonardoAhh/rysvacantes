export const vacancyWhatsAppCopy = {
  triggerLabel: "Consultar por WhatsApp",
  triggerAriaLabel: (title: string) =>
    `Preguntar por WhatsApp sobre la vacante ${title}`,
  dialogTitle: "Elige un contacto",
  dialogDescription: "Elige un número y consulta esta vacante por WhatsApp.",
  contactAriaLabel: (number: string) => `Contactar al ${number} por WhatsApp`,
  contactLabel: "WhatsApp",
} as const
