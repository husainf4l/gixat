import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Role } from '../entities/role.entity';
import { RoleService } from '../services/role.service';

@Resolver(() => Role)
export class RoleResolver {
  constructor(private roleService: RoleService) {}

  @Query(() => [Role])
  async roles(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @Query(() => Role, { nullable: true })
  async role(@Args('id', { type: () => Int }) id: number): Promise<Role | null> {
    return this.roleService.findById(id);
  }

  @Query(() => [Role])
  async rolesByBusiness(
    @Args('businessId', { type: () => Int }) businessId: number,
  ): Promise<Role[]> {
    return this.roleService.findByBusinessId(businessId);
  }
}
