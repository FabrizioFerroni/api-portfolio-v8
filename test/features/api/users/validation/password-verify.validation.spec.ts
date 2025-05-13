import { PasswordVerifyConstraint } from '@/features/api/user/validation/passwordverify.validation';
import { ValidationArguments } from 'class-validator';

describe('PasswordVerifyConstraint', () => {
  let validator: PasswordVerifyConstraint;

  beforeEach(() => {
    validator = new PasswordVerifyConstraint();
  });

  it('debería retornar true si los valores coinciden', () => {
    const args = {
      constraints: ['password'],
      object: { password: 'MySecret123' },
    } as ValidationArguments;

    const result = validator.validate('MySecret123', args);
    expect(result).toBe(true);
  });

  it('debería retornar false si los valores no coinciden', () => {
    const args = {
      constraints: ['password'],
      object: { password: 'MySecret123' },
    } as ValidationArguments;

    const result = validator.validate('OtherPassword', args);
    expect(result).toBe(false);
  });

  it('debería devolver el mensaje de error correcto', () => {
    const args = {
      property: 'confirmPassword',
      constraints: ['password'],
    } as ValidationArguments;

    const message = validator.defaultMessage(args);
    expect(message).toBe('password and confirmPassword does not match');
  });
});
