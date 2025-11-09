import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
    });
  }

  async findByBusinessId(businessId: number): Promise<Role[]> {
    return this.roleRepository.find({
      where: { businessId, isActive: true },
      relations: ['permissions'],
    });
  }

  async findById(id: number): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'business'],
    });
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.roleRepository.create(roleData);
    return this.roleRepository.save(role);
  }

  async update(id: number, roleData: Partial<Role>): Promise<Role | null> {
    await this.roleRepository.update(id, roleData);
    return this.findById(id);
  }

  async assignPermissions(roleId: number, permissionIds: number[]): Promise<Role | null> {
    const role = await this.findById(roleId);
    if (!role) return null;
    
    role.permissions = permissionIds.map(id => ({ id } as any));
    return this.roleRepository.save(role);
  }
}
