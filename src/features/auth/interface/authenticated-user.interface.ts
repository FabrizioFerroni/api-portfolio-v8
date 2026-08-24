export interface AuthenticatedUser {
  email: string;
  id: string;
  sessionId: string;
  rememberMe: boolean;
}
