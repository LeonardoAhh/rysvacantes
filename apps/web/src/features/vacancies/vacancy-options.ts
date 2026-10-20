export const vacancyOptions = {
  shift: ["Turno 1", "Turno 2", "Turno 3", "Turno 4", "Mixto", "Rolados"],
  area: [
    "Almacén",
    "Producción",
    "Taller de Moldes",
    "Mantenimiento",
    "Logística",
    "Recursos Humanos",
    "Sistema",
    "Calidad",
    "Proyectos",
  ],
  location: ["Parque Industrial Querétaro", "Iztapalapa"],
  modality: ["Presencial", "Híbrida"],
  employmentType: ["Tiempo completo"],
  education: [
    "Primaria",
    "Secundaria",
    "Preparatoria",
    "TSU",
    "Universidad",
    "Licenciatura",
    "Ingeniería",
    "Recién egresado",
  ],
  workSchedule: ["6:00 - 14:00", "14:00 - 22:00", "22:00 - 6:00", "8:00 -18:00"],
  workDays: ["Lun - Sab", "Mie - Dom", "Vie - Mar"],
  restDays: ["Dom", "Lun - Mar", "Mie - Jue"],
} as const

export type VacancyOptionField = keyof typeof vacancyOptions

export function isVacancyOptionField(
  field: string
): field is VacancyOptionField {
  return Object.hasOwn(vacancyOptions, field)
}

function optionKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
}

const aliases: Partial<Record<VacancyOptionField, Record<string, string>>> = {
  shift: {
    "1": "Turno 1",
    "2": "Turno 2",
    "3": "Turno 3",
    "4": "Turno 4",
    "rolar turnos": "Rolados",
    "turnos rolados": "Rolados",
  },
  workSchedule: {
    "06:00 a 14:00": "6:00 - 14:00",
    "6:00 a 14:00": "6:00 - 14:00",
    "06:00 - 14:00": "6:00 - 14:00",
    "14:00 a 22:00": "14:00 - 22:00",
    "22:00 a 06:00": "22:00 - 6:00",
    "22:00 a 6:00": "22:00 - 6:00",
    "22:00 - 06:00": "22:00 - 6:00",
  },
  workDays: {
    "lunes a sabado": "Lun - Sab",
    "miercoles a domingo": "Mie - Dom",
    "viernes a martes": "Vie - Mar",
  },
  restDays: {
    domingo: "Dom",
    "lunes y martes": "Lun - Mar",
    "miercoles y jueves": "Mie - Jue",
  },
}

export function normalizeVacancyOption(
  field: VacancyOptionField,
  value: string
) {
  const key = optionKey(value)
  const fieldAliases = aliases[field]
  const alias =
    fieldAliases && Object.hasOwn(fieldAliases, key)
      ? fieldAliases[key]
      : undefined
  return (
    vacancyOptions[field].find((option) => optionKey(option) === key) ??
    alias ??
    value.trim()
  )
}

export function formatVacancySalary(value: string) {
  const amount = value.replace(/\$/g, "").trim()
  return amount ? `$${amount}` : ""
}
