import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
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
import { RefreshtokenDto } from '../dtos/refresh-token.dto';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
@ApiTags('Autenticacion de usuario')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
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
  login(@Req() req: Request) {
    const user = req['user'] as UserDocument;
    return this.authService.generateJWTTokenAuth(user);
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
  refreshToken(@Body() dto: RefreshtokenDto) {
    return this.authService.refresh(dto);
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
}
