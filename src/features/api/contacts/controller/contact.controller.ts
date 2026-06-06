import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ContactService } from '../service/contact.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { CreateResponseDto } from '@/shared/utils/dtos/swagger/createresponse.dto';
import { SendContactDto } from '../dto/send-contact.dto';
import { clearScreenDown } from 'readline';
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';
import { Authorize } from '@/features/auth/decorators/authorized.decorators';
import { ApiKeyLogin } from '@/features/auth/decorators/apikey.decorator';
import { UpdateStatusDto } from '../dto/update-status.dto';

@Controller('contact')
@ApiTags('Contactos')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all contacts',
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
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiOperation({ summary: 'Get all contacts' })
  @Authorize()
  @ApiBearerAuth()
  async getAllContacts(@Query() param: PaginationDto) {
    return await this.contactService.getAllContacts(param);
  }

  @Get('count')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get stadistic for a contacts',
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
  @ApiOperation({ summary: 'Get stadistic for a contacts' })
  async countContacts() {
    return await this.contactService.countAllContacts();
  }

  @Get(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get contact by id',
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
    description: 'Contact not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get contact by id' })
  @Authorize()
  @ApiBearerAuth()
  async findOneID(@Param('id') id: string) {
    return await this.contactService.findOneId(id);
  }

  @Get('em/:email')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get contact by id',
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
    description: 'Contact not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get contact by email' })
  @Authorize()
  @ApiBearerAuth()
  async findOneEmail(@Param('email') email: string) {
    return await this.contactService.findOneEmail(email);
  }

  @Get('ems/:email')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all contacts by email',
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
    description: 'Contact not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get all contacts by email' })
  @Authorize()
  @ApiBearerAuth()
  async getAllContatsEmail(@Param('email') email: string) {
    return await this.contactService.getAllContactsEmail(email);
  }

  @Get('sb/:subject')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get contact by subject',
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
    description: 'Contact not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get contact by subject' })
  @Authorize()
  @ApiBearerAuth()
  async findOneSubject(@Param('subject') subject: string) {
    return await this.contactService.findOneSubject(subject);
  }

  @Get('sbs/:subject')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all contacts by subject',
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
    description: 'Contact not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get all contacts by subject' })
  @Authorize()
  @ApiBearerAuth()
  async getAllContatsSubject(@Param('subject') subject: string) {
    return await this.contactService.getAllContactsSubject(subject);
  }

  @Post()
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Send contact to mail and save in database',
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
  @ApiOperation({ summary: 'Send contact to mail and save in database' })
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('api-key')
  @ApiKeyLogin()
  create(@Body() dto: SendContactDto) {
    return this.contactService.createContact(dto);
  }

  @Patch('status/:id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Update a status contact with id',
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
    description: 'Contact not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Update an status contact by id' })
  @Authorize()
  @ApiBearerAuth()
  async updateStatusContact(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.contactService.updateStatus(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Delete a contact with id',
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
    description: 'Contact not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Delete an contact by id' })
  @Authorize()
  @ApiBearerAuth()
  async deleteContact(@Param('id') id: string) {
    return await this.contactService.deleteContact(id);
  }
}
