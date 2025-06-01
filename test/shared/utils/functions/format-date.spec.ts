import {
  formatDate,
  formatDateTime,
  formatDateTimeWithSeconds,
  formatTime,
} from '@/shared/utils/functions/format-date';

describe('formatDate', () => {
  it('debe formatear correctamente una fecha', () => {
    expect(formatDate(new Date('2023-08-05T00:00:00'))).toBe('05/08/2023');
  });

  it('debe aceptar un string como entrada', () => {
    expect(formatDate('2023-12-01T00:00:00')).toBe('01/12/2023');
  });
});

describe('formatDateTime', () => {
  it('debe formatear correctamente fecha y hora sin segundos', () => {
    const date = new Date('2023-08-05T14:30:00');
    expect(formatDateTime(date)).toBe('05/08/2023 14:30');
  });

  it('debe aceptar un string como entrada', () => {
    expect(formatDateTime('2023-08-05T09:45:00')).toBe('05/08/2023 09:45');
  });

  it('debe retornar null si la entrada es falsy', () => {
    expect(formatDateTime('')).toBeNull();
  });
});

describe('formatTime', () => {
  it('debe formatear solo la hora y los minutos', () => {
    const date = new Date('2023-08-05T07:05:00');
    expect(formatTime(date)).toBe('07:05');
  });

  it('debe aceptar un string como entrada', () => {
    expect(formatTime('2023-08-05T22:15:00')).toBe('22:15');
  });
});

describe('formatDateTimeWithSeconds', () => {
  it('debe formatear fecha, hora y segundos', () => {
    const date = new Date('2023-08-05T10:20:30');
    expect(formatDateTimeWithSeconds(date)).toBe('05/08/2023 10:20:30');
  });

  it('debe aceptar un string como entrada', () => {
    expect(formatDateTimeWithSeconds('2023-08-05T23:59:59')).toBe(
      '05/08/2023 23:59:59',
    );
  });
});
