import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Client } from '../entities/client.entity';
import { ClientService } from '../services/client.service';
import { CreateClientInput, UpdateClientInput } from '../dto/garage.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/user.entity';

@Resolver(() => Client)
@UseGuards(JwtAuthGuard)
export class ClientResolver {
  constructor(private clientService: ClientService) {}

  @Query(() => [Client])
  async clients(
    @Args('businessId', { type: () => ID, nullable: true }) businessId?: number,
  ): Promise<Client[]> {
    return this.clientService.findAll(businessId);
  }

  @Query(() => Client, { nullable: true })
  async client(@Args('id', { type: () => ID }) id: number): Promise<Client | null> {
    return this.clientService.findById(id);
  }

  @Query(() => [Client])
  async clientsByBusiness(
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<Client[]> {
    return this.clientService.findByBusinessId(businessId);
  }

  @Query(() => [Client])
  async searchClients(
    @Args('businessId', { type: () => ID }) businessId: number,
    @Args('searchTerm') searchTerm: string,
  ): Promise<Client[]> {
    return this.clientService.searchClients(businessId, searchTerm);
  }

  @Query(() => ClientStats)
  async clientStats(
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<any> {
    return this.clientService.getClientStats(businessId);
  }

  @Mutation(() => Client)
  async createClient(
    @Args('input') createClientInput: CreateClientInput,
    @CurrentUser() user: User,
  ): Promise<Client> {
    // Get businessId from the authenticated user
    if (!user.businessId) {
      throw new Error('User is not associated with any garage/business. Please create or join a garage first.');
    }
    return this.clientService.create(createClientInput, user.businessId);
  }

  @Mutation(() => Client, { nullable: true })
  async updateClient(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') updateClientInput: UpdateClientInput,
  ): Promise<Client | null> {
    return this.clientService.update(id, updateClientInput);
  }

  @Mutation(() => Boolean)
  async deleteClient(@Args('id', { type: () => ID }) id: number): Promise<boolean> {
    return this.clientService.softDelete(id);
  }
}

// Add this ObjectType for stats
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ClientStats {
  @Field(() => Int)
  totalClients: number;

  @Field(() => Int)
  activeClients: number;

  @Field(() => Int)
  clientsWithCars: number;

  @Field(() => Int)
  totalCars: number;
}