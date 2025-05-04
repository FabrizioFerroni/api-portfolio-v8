import { MessagesCommon } from '../messages/common/common.messages';
import { HttpStatusCodeToEnumKey } from '../messages/common/http.enum';

export function getHttpStatusMessage(statusCode: number): string {
  const enumKey = HttpStatusCodeToEnumKey[statusCode];
  return enumKey ? MessagesCommon[enumKey] : 'Estado desconocido';
}
