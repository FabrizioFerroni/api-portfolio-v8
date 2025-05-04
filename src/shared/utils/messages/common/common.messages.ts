export enum MessagesCommon {
  REQUEST_SUCCESFULL = 'Solicitud éxitosa',
  // 1xx Informational
  CONTINUE = 'Continuar',
  SWITCHING_PROTOCOLS = 'Cambiando protocolos',
  PROCESSING = 'Procesando',

  // 2xx Success
  OK = 'Solicitud exitosa',
  CREATED = 'Recurso creado exitosamente',
  ACCEPTED = 'Solicitud aceptada',
  NON_AUTHORITATIVE_INFORMATION = 'Información no autorizada',
  NO_CONTENT = 'Sin contenido',
  RESET_CONTENT = 'Contenido reiniciado',
  PARTIAL_CONTENT = 'Contenido parcial',

  // 3xx Redirection
  MULTIPLE_CHOICES = 'Múltiples opciones',
  MOVED_PERMANENTLY = 'Movido permanentemente',
  FOUND = 'Encontrado',
  SEE_OTHER = 'Ver otro',
  NOT_MODIFIED = 'No modificado',
  TEMPORARY_REDIRECT = 'Redirección temporal',
  PERMANENT_REDIRECT = 'Redirección permanente',

  // 4xx Client Error
  BAD_REQUEST = 'Solicitud incorrecta',
  UNAUTHORIZED = 'No autorizado',
  PAYMENT_REQUIRED = 'Pago requerido',
  FORBIDDEN = 'Prohibido',
  NOT_FOUND = 'No encontrado',
  METHOD_NOT_ALLOWED = 'Método no permitido',
  NOT_ACCEPTABLE = 'No aceptable',
  CONFLICT = 'Conflicto',
  GONE = 'Recurso eliminado',
  LENGTH_REQUIRED = 'Longitud requerida',
  PAYLOAD_TOO_LARGE = 'Carga útil demasiado grande',
  URI_TOO_LONG = 'URI demasiado larga',
  UNSUPPORTED_MEDIA_TYPE = 'Tipo de medio no soportado',
  TOO_MANY_REQUESTS = 'Demasiadas solicitudes',

  // 5xx Server Error
  INTERNAL_SERVER_ERROR = 'Error interno del servidor',
  NOT_IMPLEMENTED = 'No implementado',
  BAD_GATEWAY = 'Puerta de enlace incorrecta',
  SERVICE_UNAVAILABLE = 'Servicio no disponible',
  GATEWAY_TIMEOUT = 'Tiempo de espera agotado',
  HTTP_VERSION_NOT_SUPPORTED = 'Versión HTTP no soportada',
}
