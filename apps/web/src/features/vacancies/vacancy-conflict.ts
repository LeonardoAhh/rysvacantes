export class VacancyConflictError extends Error {
  constructor() {
    super(
      "Otra persona modificó o archivó esta vacante. Tus cambios siguen en el formulario. Cierra y vuelve a abrir la vacante para revisar los datos actuales."
    )
    this.name = "VacancyConflictError"
  }
}
