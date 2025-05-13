import {
  IS_PUBLIC_KEY,
  Public,
} from '@/features/auth/decorators/public.decorator';
import { SetMetadata } from '@nestjs/common';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  SetMetadata: jest.fn(),
}));

describe('Public Decorator', () => {
  it('should call SetMetadata with IS_PUBLIC_KEY and true', () => {
    Public();

    expect(SetMetadata).toHaveBeenCalledWith(IS_PUBLIC_KEY, true);
  });

  afterEach(() => {
    (SetMetadata as jest.Mock).mockClear();
  });
});
