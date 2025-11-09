import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { PermissionAction, PermissionResource } from '../enums/permission.enum';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async findById(id: number): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { id } });
  }

  async create(permissionData: Partial<Permission>): Promise<Permission> {
    const permission = this.permissionRepository.create(permissionData);
    return this.permissionRepository.save(permission);
  }

  async seedDefaultPermissions(): Promise<void> {
    const permissions: Array<{
      name: string;
      resource: PermissionResource;
      action: PermissionAction;
    }> = [
      {
        name: 'Create Users',
        resource: PermissionResource.USERS,
        action: PermissionAction.CREATE,
      },
      {
        name: 'Read Users',
        resource: PermissionResource.USERS,
        action: PermissionAction.READ,
      },
      {
        name: 'Update Users',
        resource: PermissionResource.USERS,
        action: PermissionAction.UPDATE,
      },
      {
        name: 'Delete Users',
        resource: PermissionResource.USERS,
        action: PermissionAction.DELETE,
      },
      {
        name: 'Manage Roles',
        resource: PermissionResource.ROLES,
        action: PermissionAction.MANAGE,
      },
      {
        name: 'Create Products',
        resource: PermissionResource.PRODUCTS,
        action: PermissionAction.CREATE,
      },
      {
        name: 'Read Products',
        resource: PermissionResource.PRODUCTS,
        action: PermissionAction.READ,
      },
      {
        name: 'Update Products',
        resource: PermissionResource.PRODUCTS,
        action: PermissionAction.UPDATE,
      },
      {
        name: 'Delete Products',
        resource: PermissionResource.PRODUCTS,
        action: PermissionAction.DELETE,
      },
    ];

    for (const perm of permissions) {
      const exists = await this.permissionRepository.findOne({
        where: { resource: perm.resource, action: perm.action },
      });

      if (!exists) {
        await this.create(perm);
      }
    }
  }
}
