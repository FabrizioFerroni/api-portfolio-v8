import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create.dto';
import { UserService } from '../service/user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { CreateResponseDto } from '@/shared/utils/dtos/swagger/createresponse.dto';
import { Authorize } from '@/features/auth/decorators/authorized.decorators';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { File } from '@/shared/decorators/file.decorator';
import { userStorage } from '../storage/user.storage';
import { ImageUploadPipe } from '@/shared/pipes/image-upload.pipe';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UserDocument } from '../schema/user.schema';
import { User } from '@/features/auth/decorators/user.decorator';

@Controller('users')
@ApiTags('Usuario')
@Authorize()
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all users',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get all users' })
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get('profile')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get profile',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'User not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get profile' })
  async getProfile(@User() user: UserDocument) {
    return await this.userService.findOne(user.id);
  }

  @Get(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get user by id',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'User not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get user by id' })
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @Get('em/:email')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get user by email',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'User not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get user by email' })
  async findOneEmail(@Param('email') email: string) {
    return await this.userService.findByEmail(email);
  }

  @Post()
  @ApiCreatedResponse({
    type: CreateResponseDto,
    isArray: false,
    description: 'Create a new user',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch('profile')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Update a user profile with id',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'User not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Update an user profile by id' })
  @File({ storage: userStorage })
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @User() user: UserDocument,
    @UploadedFile(
      ImageUploadPipe({
        maxSizeMB: 5,
        fileType: ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'],
        required: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return await this.userService.updateUserProfile(user.id, dto, file);
  }

  @Patch('password')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Update a user password with id',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'User not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Update an user password by id' })
  async updatePassword(
    @Body() dto: UpdatePasswordDto,
    @User() user: UserDocument,
  ) {
    return await this.userService.updateUserPassword(user.id, dto);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Update a user with id',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'User not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Update an user by id' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return await this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Delete a user with id',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'User not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Delete an user by id' })
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }
}
