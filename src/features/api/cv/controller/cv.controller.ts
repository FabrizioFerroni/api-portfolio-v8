import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CVService } from '../service/cv.service';
import { Response } from 'express';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { CVCUpDto } from '../dtos/create.dto';
import { File } from '@/shared/decorators/file.decorator';
import { cvMemoryStorage } from '../storage/cv.storage';
import { Authorize } from '@/features/auth/decorators/authorized.decorators';
import { ImageUploadPipe } from '@/shared/pipes/image-upload.pipe';

@Controller('cv')
@ApiTags('CV Personal')
export class CVController {
  constructor(private readonly cvService: CVService) {}

  @Get('download')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Descargar CV',
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
  @ApiSecurity('api-key')
  @ApiBearerAuth()
  async download(@Res() res: Response) {
    const { filePath, originalName, downloadName } =
      await this.cvService.resolveDownload();

    res.download(filePath, downloadName, (err) => {
      if (err) {
        console.error('Error al descargar CV:', err);
        if (!res.headersSent) {
          res
            .status(HttpStatus.NOT_FOUND)
            .json({ message: 'Archivo no disponible' });
        }
      }
    });
  }

  @Get('admin/cv')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Obtener el cv actual',
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
  @Authorize()
  @ApiBearerAuth()
  async getCurrent() {
    return await this.cvService.getCurrentCv();
  }

  @Get('admin/cv/old')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Obtener los cvs viejos',
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
  @Authorize()
  @ApiBearerAuth()
  async getOldsCV() {
    return await this.cvService.getOldsCVS();
  }

  @Post('admin/cv')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Cargar o Updatear CV',
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
  @Authorize()
  @ApiBearerAuth()
  @File({ storage: cvMemoryStorage })
  async upload(
    @UploadedFile(
      ImageUploadPipe({
        maxSizeMB: 15,
        fileType: ['application/pdf'],
        required: true,
      }),
    )
    file: Express.Multer.File,
    @Body() dto: CVCUpDto,
  ) {
    return await this.cvService.uploadNewCv(file, dto);
  }
}
