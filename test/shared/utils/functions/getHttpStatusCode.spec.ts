import { getHttpStatusMessage } from '@/shared/utils/functions/getHttpStatusCode';

jest.mock('@/shared/utils/messages/common/common.messages', () => ({
  MessagesCommon: {
    OK: 'Operación exitosa',
    NOT_FOUND: 'Recurso no encontrado',
  },
}));

jest.mock('@/shared/utils/messages/common/http.enum', () => ({
  HttpStatusCodeToEnumKey: {
    200: 'OK',
    404: 'NOT_FOUND',
  },
}));

describe('getHttpStatusMessage', () => {
  it('should return the correct message for known status code', () => {
    const message = getHttpStatusMessage(200);
    expect(message).toBe('Operación exitosa');
  });

  it('should return default message for unknown status code', () => {
    const message = getHttpStatusMessage(500);
    expect(message).toBe('Estado desconocido');
  });

  it('should return default message for undefined or null', () => {
    expect(getHttpStatusMessage(undefined as any)).toBe('Estado desconocido');
    expect(getHttpStatusMessage(null as any)).toBe('Estado desconocido');
  });
});
