import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserWithoutPassword } from './user.types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(userData: {
    name: string;
    email: string | null;
    phone: string;
    passwordHash?: string;
    role?: string;
    garageId: string;
  }): Promise<UserWithoutPassword> {
    console.log('Creating user with data:', userData); // Debugging log

    // Check if user with this email already exists
    if (userData.email) {
      const existingUserEmail = await this.prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUserEmail) {
        throw new ConflictException('Email already in use');
      }
    }

    // Check if phone is already in use
    const existingUserPhone = await this.prisma.user.findUnique({
      where: { phone: userData.phone },
    });

    if (existingUserPhone) {
      throw new ConflictException('Phone number already in use');
    }

    // Create the user with correct schema fields
    const createdUser = await this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        passwordHash: userData.passwordHash || '',
        role: userData.role ? userData.role as any : 'EMPLOYEE',
        garageId: userData.garageId,
      },
    });

    return createdUser;
  }

  // Add method for creating user from social login data
  async createFromSocial(userData: {
    email: string;
    name: string;
    passwordHash?: string;
    socialProvider?: string | null;
    socialId?: string | null;
    profilePictureUrl?: string | null;
    garageId?: string;
  }): Promise<User> {
    // Create the user with the right schema fields
    return this.prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        // This is a temporary phone value - in production, you should collect this properly
        phone: `temp-${Date.now()}`,
        passwordHash: userData.passwordHash || '',
        socialProvider: userData.socialProvider,
        socialId: userData.socialId,
        profilePictureUrl: userData.profilePictureUrl,
        garageId: userData.garageId || '1', // Use provided garageId or default
      }
    });
  }

  // Link a social account to an existing user
  async linkSocialAccount(userId: string, provider: 'google' | 'apple', socialId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        socialProvider: provider,
        socialId: socialId
      }
    });
  }

  async findAll(): Promise<UserWithoutPassword[]> {
    const users = await this.prisma.user.findMany();
    return users; // Already matches UserWithoutPassword since no password field exists
  }

  async findOne(id: string): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user; // Already matches UserWithoutPassword since no password field exists
  }

  async findByEmail(email: string): Promise<User | null> {
    // Handle null email case
    if (!email) return null;
    
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateData: Partial<User>): Promise<UserWithoutPassword> {
    // Check if user exists
    await this.findOne(id);

    // If updateData contains passwordHash, need to hash it
    let dataToUpdate: any = { ...updateData };
    
    // Remove any fields that don't exist in the schema to prevent errors
    delete dataToUpdate.password;
    
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return updatedUser; // Already matches UserWithoutPassword since no password field exists
  }

  // Update user profile (name and profile picture)
  async updateUserProfile(userId: string, updateData: {
    name?: string;
    profilePictureUrl?: string;
  }): Promise<UserWithoutPassword> {
    const updateFields: any = {};
    
    if (updateData.name) {
      updateFields.name = updateData.name;
    }
    
    if (updateData.profilePictureUrl) {
      updateFields.profilePictureUrl = updateData.profilePictureUrl;
    }
    
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateFields
    });

    return updatedUser; // Already matches UserWithoutPassword since no password field exists
  }

  async remove(id: string): Promise<UserWithoutPassword> {
    // Check if user exists
    await this.findOne(id);

    const user = await this.prisma.user.delete({
      where: { id },
    });

    return user; // Already matches UserWithoutPassword since no password field exists
  }

  // --- Refresh Token Methods ---
  async createRefreshToken(data: { token: string; userId: string; expiresAt: Date }) {
    return this.prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });
  }

  async updateRefreshToken(token: string, updateData: Partial<{ revoked: boolean }>) {
    return this.prisma.refreshToken.update({ where: { token }, data: updateData });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
