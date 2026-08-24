export enum SessionsMsjError {
  SESSION_CREATE = 'Hubo un error al crear la sesión',
  SESSION_FIND = 'Hubo un error al buscar la sesión',
  SESSION_FIND_ALL = 'Hubo un error al buscar las sesiones',
  SESSION_UPDATE = 'Hubo un error al actualizar la sesión',
  SESSION_TOUCH = 'Hubo un error al actualizar el último acceso de la sesión',
  SESSION_REMOVED = 'Hubo un error al remover la sesión',
  SESSIONS_REMOVED = 'Hubo un error al remover todas las sesiones',
  SESSION_NOT_FOUND = 'La sesión no existe o expiró',
  SESSION_UNAUTHORIZED = 'La sesión no está autorizada',
  INTERNAL_SERVER_ERROR = 'Internal server error. Contact with the administrator',
}

export enum SessionsMsjOk {
  SESSION_UPDATED = 'Se ha actualizado la sesion',
}
