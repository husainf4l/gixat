export interface JwtPayload {
  sub: number; // user id
  email: string;
  type: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: number;
  tokenId: string;
  iat?: number;
  exp?: number;
}