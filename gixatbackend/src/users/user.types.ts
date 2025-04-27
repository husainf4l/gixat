import { User as PrismaUser } from "@prisma/client";

export type User = PrismaUser;

// The User model already doesn't have a password field, it uses passwordHash
// So this type is now just an alias for User
export type UserWithoutPassword = User;

// Create helper types for social auth
export type SocialProvider = 'google' | 'apple' | null;

export interface UserCreateData {
  email: string;
  passwordHash?: string;
  name: string;
  phone: string;
  socialProvider?: SocialProvider;
  socialId?: string | null;
  profilePictureUrl?: string | null;
  garageId: string;
}