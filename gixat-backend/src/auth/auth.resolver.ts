import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { LoginInput, RegisterInput } from './dto/auth.input';
import { AuthResponse, LoginResponse, RegisterResponse, RefreshTokenResponse } from './dto/auth.response';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../user/user.entity';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Mutation(() => RegisterResponse)
  async register(@Args('input') registerInput: RegisterInput): Promise<AuthResponse> {
    return this.authService.register(registerInput);
  }

  @Mutation(() => LoginResponse)
  async login(@Args('input') loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Mutation(() => RefreshTokenResponse)
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
  ): Promise<RefreshTokenResponse> {
    return this.authService.refreshTokens(refreshToken);
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    // Fetch user with business relationship
    const userWithBusiness = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['business'],
    });
    return userWithBusiness || user;
  }

  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  async validateToken(@CurrentUser() user: User): Promise<string> {
    return `Token is valid for user: ${user.email}`;
  }
}