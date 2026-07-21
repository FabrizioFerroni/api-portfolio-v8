import { Controller, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProjectTechnologyService } from '../service/project-technology.service';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { ApiKeyLogin } from '@/features/auth/decorators/apikey.decorator';

@Controller('project-technologies')
@ApiTags('Tecnologias de los Proyectos Personales')
export class ProjectTechnologyController {
  constructor(private readonly projectTechService: ProjectTechnologyService) {}

  @Get()
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all projects technologies',
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
  @ApiOperation({ summary: 'Get all projects technologies' })
  @ApiSecurity('api-key')
  @ApiKeyLogin()
  async getAllTechnologyNames() {
    return await this.projectTechService.getAllTechnologyNames();
  }
}
