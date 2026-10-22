export const recruitmentPhones = [
  { number: "442 509 5534", whatsapp: "5214425095534" },
  { number: "55 1525 4782", whatsapp: "5215515254782" },
  { number: "55 1406 3167", whatsapp: "5215514063167" },
] as const

export function getVacancyWhatsAppUrl(vacancy: { title: string }) {
  const whatsappUrl = new URL(`https://wa.me/${recruitmentPhones[0].whatsapp}`)
  whatsappUrl.searchParams.set(
    "text",
    `Hola, me interesa la vacante "${vacancy.title}" de ViñoPlastic. ¿Cuál es el siguiente paso?`
  )
  return whatsappUrl.toString()
}
