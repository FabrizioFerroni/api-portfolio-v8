import { BodyloginMiddleware } from '@/features/auth/middleware/bodyauth.middleware';
import { DecryptCredentialsService } from '@/features/auth/services/decryptcredentials.service';

describe('BodyloginMiddleware', () => {
  let middleware: BodyloginMiddleware;
  let decryptService: DecryptCredentialsService;

  const mockDecryptService = {
    main: jest.fn(),
  };

  beforeEach(() => {
    decryptService = mockDecryptService as any;
    middleware = new BodyloginMiddleware(decryptService);
  });

  it('should return 400 if "basic" header is missing', () => {
    const req: any = { headers: {} };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Header basic is required',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call decrypt service and inject body, then call next()', () => {
    const fakeHeader = 'encrypted123';
    const fakeBody = { email: 'test@example.com', password: '12345' };

    const req: any = {
      headers: { basic: fakeHeader },
      body: {},
    };
    const res: any = {};
    const next = jest.fn();

    mockDecryptService.main.mockReturnValue(fakeBody);

    middleware.use(req, res, next);

    expect(mockDecryptService.main).toHaveBeenCalledWith(fakeHeader);
    expect(req.body).toEqual(fakeBody);
    expect(next).toHaveBeenCalled();
  });
});
