import { CreateSubcriberDto } from './create-subcriber.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateSubscriberDto extends PartialType(CreateSubcriberDto) {}
