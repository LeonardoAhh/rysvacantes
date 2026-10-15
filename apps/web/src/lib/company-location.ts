export const companyLocation = {
  street: "Av. de la Montaña núm. 98",
  industrialPark: "Parque Industrial Querétaro",
  locality: "Santa Rosa Jáuregui",
  postalCode: "76220",
  state: "Querétaro",
} as const

export const companyAddress = `${companyLocation.street}\n${companyLocation.industrialPark}\n${companyLocation.locality}, C. P. ${companyLocation.postalCode}, ${companyLocation.state}`

const mapQuery = `ViñoPlastic, ${companyLocation.street}, ${companyLocation.industrialPark}, ${companyLocation.locality}, ${companyLocation.postalCode}, ${companyLocation.state}`

export const companyMapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
export const companyMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
