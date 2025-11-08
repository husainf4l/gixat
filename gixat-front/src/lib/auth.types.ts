export type UserType = "BUSINESS" | "CLIENT" | "SYSTEM";

export interface User {
  id: string;
  email: string;
  name: string;
  type: UserType;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  type: UserType;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: string;
}

export interface AuthContext {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}
