import { registerEnumType } from '@nestjs/graphql';

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export enum PermissionResource {
  USERS = 'users',
  ROLES = 'roles',
  PRODUCTS = 'products',
  ORDERS = 'orders',
  INVOICES = 'invoices',
  SETTINGS = 'settings',
  REPORTS = 'reports',
}

registerEnumType(PermissionAction, {
  name: 'PermissionAction',
  description: 'Available permission actions',
});

registerEnumType(PermissionResource, {
  name: 'PermissionResource',
  description: 'Available resources for permissions',
});
