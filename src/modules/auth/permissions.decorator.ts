import { SetMetadata } from '@nestjs/common';
import { PermissionKey } from '../../common/types/domain';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
