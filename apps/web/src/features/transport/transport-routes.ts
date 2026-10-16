export type TransportStop = {
  area: string
  reference: string
  times: readonly [string | null, string | null, string | null]
}

export type TransportRoute = {
  id: string
  name: string
  stops: readonly TransportStop[]
}

// Transcripción de los seis horarios vigentes proporcionados por Reclutamiento.
// Los valores null corresponden a las celdas "N/A" del horario original.
const stop = (
  area: string,
  reference: string,
  first: string | null,
  second: string | null,
  third: string | null
): TransportStop => ({ area, reference, times: [first, second, third] })

export const transportRoutes: readonly TransportRoute[] = [
  {
    id: "r1",
    name: "Pie de la Cuesta",
    stops: [
      stop(
        "Pie de la Cuesta",
        "Tránsito, frente al Oxxo",
        "04:40",
        "12:40",
        "20:40"
      ),
      stop("Pie de la Cuesta", "En el CIDESI", "04:42", "12:42", "20:42"),
      stop("Pie de la Cuesta", "Frente al Elektra", "04:43", "12:43", "20:43"),
      stop(
        "Tláloc",
        "Esq. Sombrerete, en el puesto de periódicos",
        "04:48",
        "12:48",
        "20:48"
      ),
      stop(
        "Pie de la Cuesta",
        "Esq. Paseo de la Constitución, Farmacia Diagnóstica",
        "04:54",
        "12:54",
        "20:54"
      ),
      stop(
        "Pie de la Cuesta",
        "En la Bodega Aurrera",
        "04:57",
        "12:57",
        "20:57"
      ),
      stop(
        "Pie de la Cuesta",
        "Esq. Blvd. de la Nación, en el Oxxo",
        "05:01",
        "13:01",
        "21:01"
      ),
      stop(
        "Pie de la Cuesta",
        "En el Oxxo de Los Pilares",
        "05:05",
        "13:05",
        "21:05"
      ),
      stop(
        "Pie de la Cuesta",
        "Esq. Belén, en la llantera Los Vega / Tienda Neto",
        "05:09",
        "13:09",
        "21:09"
      ),
      stop(
        "Pie de la Cuesta",
        "Esq. Calle de la Amargura, en la panadería Lecaroz",
        "05:12",
        "13:12",
        "21:12"
      ),
      stop(
        "Pie de la Cuesta",
        "Esq. Concordia, donde sale la Ruta L",
        "05:16",
        "13:16",
        "21:16"
      ),
      stop(
        "Pie de la Cuesta",
        "Frente a la carnicería Los Padillas",
        "05:18",
        "13:18",
        "21:18"
      ),
      stop(
        "Av. Pedregal",
        "Segunda parada de camiones",
        "05:20",
        "13:20",
        "21:20"
      ),
      stop("Km. 15", "Parada de camiones", "05:30", "13:30", "21:30"),
      stop("ViñoPlastic", "Planta", "05:50", "13:50", "21:50"),
    ],
  },
  {
    id: "r2",
    name: "San José Iturbide 1",
    stops: [
      stop(
        "San José Iturbide",
        "Parada en la escuela 5 de Mayo",
        "04:40",
        "12:40",
        "20:10"
      ),
      stop("San José Iturbide", "Parada Steren", "04:45", "12:45", "20:15"),
      stop(
        "San José Iturbide",
        "Prados del Rosario, parada en la escuela",
        "04:48",
        "12:48",
        "20:18"
      ),
      stop(
        "San José Iturbide",
        "Cruz Roja Mexicana",
        "04:55",
        "12:55",
        "20:25"
      ),
      stop(
        "San José Iturbide",
        "Parada de autobuses de Coppel",
        "05:00",
        "13:00",
        "20:30"
      ),
      stop(
        "San José Iturbide",
        "Parada de la Alameda",
        "05:02",
        "13:02",
        "20:32"
      ),
      stop(
        "San José Iturbide",
        "Parada de Ma. Teresa",
        "05:05",
        "13:05",
        "20:35"
      ),
      stop(
        "San José Iturbide",
        "Parada en el Modelorama, sobre carretera",
        "05:08",
        "13:08",
        "20:38"
      ),
      stop(
        "Puerto Carroza",
        "Parada de autobuses, sobre carretera",
        "05:18",
        "13:18",
        "20:48"
      ),
      stop(
        "Ojo de Agua",
        "Parada entrada a la comunidad, sobre carretera",
        "05:23",
        "13:23",
        "20:53"
      ),
      stop(
        "Rincón de Ojo de Agua",
        "P. entronque, entrando a la comunidad, parada de autobuses sobre carretera",
        "05:30",
        "13:30",
        "21:00"
      ),
      stop(
        "Rincón de Ojo de Agua",
        "Parada en el entronque",
        "05:35",
        "13:35",
        "21:05"
      ),
      stop("La Luz", "Parada en el puente peatonal", null, null, "21:10"),
      stop("La Luz", "Parada en la iglesia", null, null, "21:15"),
      stop("La Barreta", "Tienda, en la entrada", null, null, "21:35"),
      stop(
        "Los Materiales",
        "Entrada a Buenavista, frente a la gasolinera Shell",
        null,
        null,
        "21:40"
      ),
      stop(
        "Buenavista",
        "Parada frente al barco de mariscos Chilos",
        null,
        null,
        "21:41"
      ),
      stop(
        "Buenavista",
        "Parada de autobuses, secundaria",
        null,
        null,
        "21:45"
      ),
      stop("ViñoPlastic", "Planta", "05:50", "13:50", "21:50"),
    ],
  },
  {
    id: "r3",
    name: "San José Iturbide 2",
    stops: [
      stop("La Luz", "Parada en el puente peatonal", "04:55", "12:55", null),
      stop("La Luz", "Parada en la iglesia", "04:57", "12:57", null),
      stop(
        "La Luz",
        "Parada en la curva de la recicladora",
        "05:04",
        "13:04",
        null
      ),
      stop("La Barreta", "Tienda, en la entrada", "05:13", "13:13", null),
      stop(
        "La Monja",
        "Sobre carr. en el puente peatonal",
        "05:22",
        "13:22",
        null
      ),
      stop(
        "La Monja",
        "En la terracería de la curva, en la casita con barda de piedra con 2 postes de luz",
        "05:23",
        "13:23",
        null
      ),
      stop(
        "Buenavista",
        "Parada sobre carr. a San Miguel, en Materiales Beltrán",
        "05:29",
        "13:29",
        null
      ),
      stop(
        "Buenavista",
        "Parada frente al barco de Chilos",
        "05:31",
        "13:31",
        null
      ),
      stop(
        "Buenavista",
        "Parada de autobuses de la secundaria",
        "05:32",
        "13:32",
        null
      ),
      stop("ViñoPlastic", "Planta", "05:50", "13:50", null),
    ],
  },
  {
    id: "r4",
    name: "Santa Rosa",
    stops: [
      stop("Santa Rosa", "En el puente de la Cruz", "04:55", "12:55", "20:55"),
      stop(
        "Santa Rosa",
        "En el puente de las Rosas",
        "04:57",
        "12:57",
        "20:57"
      ),
      stop(
        "Santa Rosa",
        "C. Independencia, parada de camiones Primaria Emiliano Zapata",
        "05:02",
        "13:02",
        "21:02"
      ),
      stop("Montenegro", "Lonchería Lili", "05:07", "13:07", "21:07"),
      stop("Hda Santa Rosa", "Farmacia GDL", "05:12", "13:12", "21:12"),
      stop(
        "Hda Santa Rosa",
        "Enfrente al Water House",
        "05:15",
        "13:15",
        "21:15"
      ),
      stop(
        "Fracc. Montenegro",
        "Parada de camiones Huizache",
        "05:22",
        "13:22",
        "21:22"
      ),
      stop(
        "Fracc. Montenegro",
        "Parada en la calle Yuca y Blvd. Montenegro",
        "05:23",
        "13:23",
        "21:23"
      ),
      stop(
        "Pto Aguirre",
        "Parada en la tortillería",
        "05:33",
        "13:33",
        "21:33"
      ),
      stop("Pto Aguirre", "Parada en el mezquite", "05:35", "13:35", "21:35"),
      stop("ViñoPlastic", "Planta", "05:50", "13:50", "21:50"),
    ],
  },
  {
    id: "r5",
    name: "Av. de la Luz",
    stops: [
      stop(
        "Av. de la Luz",
        "Esq. Matlazincas, en la Farmacia Guadalajara",
        "04:48",
        "12:48",
        "20:48"
      ),
      stop(
        "Prol. Bernardo Quintana",
        "Parada de camiones, frente al taller de motos Crys Rider",
        "04:50",
        "12:50",
        "20:50"
      ),
      stop(
        "Prol. Bernardo Quintana",
        "Parada en la esquina del camino a San Pedro Mártir",
        "04:53",
        "12:53",
        "20:53"
      ),
      stop("Plaza del Sol", "En el KFC", "04:58", "12:58", "20:58"),
      stop(
        "Obrera",
        "Parada de camiones, en el Oxxo de la calle Coahuila",
        "05:05",
        "13:05",
        "21:05"
      ),
      stop(
        "5 de Febrero",
        "Parada en el puente peatonal de Tremec",
        "05:15",
        "13:15",
        "21:15"
      ),
      stop("Salitre", "Frente al jardín", "05:25", "13:25", "21:25"),
      stop("Santa Catarina", "Parada de camiones", "05:40", "13:40", "21:40"),
      stop("San Isidro", "Parada de camiones", "05:43", "13:43", "21:43"),
      stop("Corea", "Parada de camiones", "05:45", "13:45", "21:45"),
      stop("ViñoPlastic", "Planta", "05:50", "13:50", "21:50"),
    ],
  },
  {
    id: "r6",
    name: "Paseo Querétaro",
    stops: [
      stop("Peñaflor", "Bodega Aurrera Peñaflor", "04:35", "12:35", "20:35"),
      stop(
        "Av. de la Luz",
        "Parada de camiones esq. Mayas",
        "04:45",
        "12:45",
        "20:45"
      ),
      stop(
        "Av. de la Luz",
        "Parada de camiones, frente a Bodega Aurrera",
        "04:48",
        "12:48",
        "20:48"
      ),
      stop(
        "Paseo Querétaro",
        "Paseo Querétaro esq. Pirineos",
        "04:58",
        "12:58",
        "20:58"
      ),
      stop(
        "Paseo Querétaro",
        "Parada de camiones, frente al Inspire Gym",
        "05:00",
        "13:00",
        "21:00"
      ),
      stop(
        "Paseo Querétaro",
        "Paseo Querétaro esq. Plan de San Luis",
        "05:04",
        "13:04",
        "21:04"
      ),
      stop(
        "Paseo Querétaro",
        "Parada de camiones en el Asturiano Av. San Daniel",
        "05:07",
        "13:07",
        "21:07"
      ),
      stop(
        "Paseo Querétaro",
        "Parada en la panadería Lecaroz",
        "05:10",
        "13:10",
        "21:10"
      ),
      stop(
        "Paseo Querétaro",
        "Parada en el Oxxo de Puertas de San Miguel",
        "05:13",
        "13:13",
        "21:13"
      ),
      stop(
        "Paseo Querétaro",
        "Parada en Oxxo de Juncos",
        "05:15",
        "13:15",
        "21:15"
      ),
      stop(
        "Mompaní",
        "Parada en el tope, frente a la ferretería Josué",
        "05:20",
        "13:20",
        "21:20"
      ),
      stop("ViñoPlastic", "Planta", "05:50", "13:50", "21:50"),
    ],
  },
]
