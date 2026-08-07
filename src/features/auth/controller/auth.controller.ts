import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { LocalGuard } from '../guards/local.guard';
import { Request } from 'express';
import { UserDocument } from '@/features/api/user/schema/user.schema';
import { Authorize } from '../decorators/authorized.decorators';
import { User } from '../decorators/user.decorator';
import { UserService } from '@/features/api/user/service/user.service';
import { Public } from '../decorators/public.decorator';
import { Response } from 'express';
import { Cookies } from '@/shared/decorators/cookies.decorator';
import { TokenDto } from '../dtos/token.dto';
import { configApp } from '@/config/app/config.app';
import { TokenService } from '@/shared/services/token.service';
import { AuthMessagesError } from '../errors/error-messages';

@Controller('auth')
@ApiTags('Autenticacion de usuario')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  @ApiResponse({
    status: HttpStatus.OK,
    type: OkResponseDto,
    isArray: false,
    description: 'Login a user with the specified credentials',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Not Found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiHeader({
    name: 'basic',
    description: 'Header for secure authentication',
  })
  @ApiOperation({ summary: 'Login with secure credentials' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalGuard)
  async login(
    @Req() req: Request,
    @Body('rememberMe') rememberMe: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userReq = req['user'] as UserDocument;
    const result = await this.authService.generateJWTTokenAuth(
      userReq,
      rememberMe,
    );
    const { refresh_token, ...body } = result;

    this.setCookie(res, rememberMe, refresh_token);

    return {
      user: {
        id: body.user._id.toString(),
        name: body.user.name,
        lastname: body.user.lastname,
        email: body.user.email,
        avatar: body.user.avatar,
      },
      access_token: body.access_token,
    };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Metodo para refrescar el token del usuario',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: OkResponseDto,
    description: 'Metodo para refrescar el token del usuario',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ErrorResponseDto,
    description: 'Datos incorrectos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: ErrorResponseDto,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ErrorResponseDto,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: ErrorResponseDto,
    description: 'Hubo un error interno en el servidor',
  })
  @HttpCode(HttpStatus.OK)
  @Public()
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Cookies('refresh_token') refreshToken: string,
  ) {
    if (!refreshToken)
      throw new UnauthorizedException(AuthMessagesError.TOKEN_INVALID);

    const result = await this.authService.refresh({ token: refreshToken });
    const { refresh_token, ...body } = result;

    const decoded = this.tokenService.verifyJWTToken<TokenDto>(
      refresh_token,
      configApp().secret_jwt_refresh,
    );

    this.setCookie(res, decoded.rememberMe, refresh_token);

    return body;
  }

  @Get('profile')
  @ApiResponse({
    status: HttpStatus.OK,
    type: OkResponseDto,
    description: 'Metodo para obtener datos del usuario logueado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ErrorResponseDto,
    description: 'Datos incorrectos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: ErrorResponseDto,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ErrorResponseDto,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: ErrorResponseDto,
    description: 'Hubo un error interno en el servidor',
  })
  @ApiOperation({
    summary: 'Metodo para obtener datos del usuario logueado',
  })
  @Authorize()
  @ApiBearerAuth()
  /**
   * Retrieves the profile information of the currently logged-in user.
   *
   * @param {UserDocument} user - The logged-in user schema containing the user ID.
   * @returns {Promise<ResponseUserDto>} The user profile data.
   *
   * @throws {NotFoundException} If the user is not found.
   */
  obtainUser(@User() { id }: UserDocument) {
    return this.userService.findOne(id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Authorize()
  @ApiBearerAuth()
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = (req['user'] as { id: string }).id;
    await this.authService.invalidateTokens(userId);
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return;
  }

  private setCookie(
    res: Response,
    rememberMe: boolean,
    refreshToken: string,
  ): void {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
    });
  }
}
