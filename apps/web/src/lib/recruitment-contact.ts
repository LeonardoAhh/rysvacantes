export const recruitmentPhones = [
  { number: "442 509 5534", whatsapp: "5214425095534" },
  { number: "55 1525 4782", whatsapp: "5215515254782" },
  { number: "55 1406 3167", whatsapp: "5215514063167" },
] as const

export function getVacancyWhatsAppMessage(vacancy: { title: string }) {
  return `Hola, me interesa la vacante "${vacancy.title}" de ViñoPlastic. ¿Cuál es el siguiente paso?`
}

export function getVacancyWhatsAppUrl(
  vacancy: { title: string },
  whatsapp: (typeof recruitmentPhones)[number]["whatsapp"]
) {
  const whatsappUrl = new URL(`https://wa.me/${whatsapp}`)
  whatsappUrl.searchParams.set("text", getVacancyWhatsAppMessage(vacancy))
  return whatsappUrl.toString()
}
