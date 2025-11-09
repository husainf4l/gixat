import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../user/user.entity';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => User)
  user: User;

  @Field()
  expiresIn: string;
}

@ObjectType()
export class LoginResponse extends AuthResponse {}

@ObjectType()
export class RegisterResponse extends AuthResponse {}

@ObjectType()
export class RefreshTokenResponse {
  @Field()
  accessToken: string;

  @Field()
  expiresIn: string;
}