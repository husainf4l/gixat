import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserBusiness } from './entities/user-business.entity';
import { User } from '../user/user.entity';
import { BusinessResolver } from './resolvers/business.resolver';
import { RoleResolver } from './resolvers/role.resolver';
import { PermissionResolver } from './resolvers/permission.resolver';
import { BusinessService } from './services/business.service';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, Role, Permission, UserBusiness, User]),
  ],
  providers: [
    BusinessResolver,
    RoleResolver,
    PermissionResolver,
    BusinessService,
    RoleService,
    PermissionService,
  ],
  exports: [TypeOrmModule, BusinessService, RoleService, PermissionService],
})
export class BusinessModule {}
