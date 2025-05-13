import {
  hashPassword,
  validatePassword,
} from '@/shared/utils/functions/validate-passwords';

describe('validatePassword', () => {
  it('should return true when password is valid', async () => {
    const password = 'password123';
    const userPassword = await hashPassword('password123');

    const result = await validatePassword(password, userPassword);

    expect(result).toBe(true);
  });

  it('should return false when password is invalid', async () => {
    const password = 'wrongpassword';
    const userPassword = await hashPassword('password123');

    const result = await validatePassword(password, userPassword);

    expect(result).toBe(false);
  });

  it('should return a valid bcrypt hash for the given password', async () => {
    const password = 'mySecret123';

    const hashed = await hashPassword(password);

    expect(typeof hashed).toBe('string');
    expect(hashed.length).toBeGreaterThan(0);

    const isValid = await validatePassword(password, hashed);

    expect(isValid).toBe(true);
  });
});
