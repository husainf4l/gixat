import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Permission } from '../entities/permission.entity';
import { PermissionService } from '../services/permission.service';

@Resolver(() => Permission)
export class PermissionResolver {
  constructor(private permissionService: PermissionService) {}

  @Query(() => [Permission])
  async permissions(): Promise<Permission[]> {
    return this.permissionService.findAll();
  }

  @Query(() => Permission, { nullable: true })
  async permission(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Permission | null> {
    return this.permissionService.findById(id);
  }
}
