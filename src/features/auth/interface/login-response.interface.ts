import { AuthResponseDto } from '../dtos/response-auth.dto';

export interface LoginResponseAuth {
  user?: AuthResponseDto;
  access_token: string;
  refresh_token: string;
}
