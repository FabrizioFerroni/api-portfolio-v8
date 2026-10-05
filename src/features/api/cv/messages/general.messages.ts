export enum CVError {
  CV_ALREADY_EXIST = 'No es posible realizar esta acción. El CV que intentas cargar ya esta subido en el sistema.',
  CV_NOT_FOUND = 'No se encontro el CV buscado.',
  INTERNAL_SERVER_ERROR = 'Error interno del servidor. Por favor contactate con el administrador del sistema.',
  CV_ERROR = 'Oops... Hay problemas para crear o editar el CV. Por favor intente nuevamente más tarde.',
}

export enum CVMessages {
  CV_CREATED = 'Se subio correctamente el CV',
  CV_UPDATED = 'El CV fue modificado correctamente',
  CV_REMOVED = 'Se elimino el CV correctamente',
}
