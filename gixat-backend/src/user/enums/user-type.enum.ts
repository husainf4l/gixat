import { registerEnumType } from '@nestjs/graphql';

export enum UserType {
  BUSINESS = 'business',
  CLIENT = 'client',
  SYSTEM = 'system',
}

registerEnumType(UserType, {
  name: 'UserType',
  description: 'The type of user account',
});
