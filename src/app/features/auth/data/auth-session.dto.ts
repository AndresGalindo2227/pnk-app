/** Mirror of the OpenAPI AuthSession schema. Lives only in the data layer. */
export interface AuthSessionDto {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  player: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    role: 'player' | 'admin';
  };
}
