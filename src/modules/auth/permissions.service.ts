import { Injectable } from '@nestjs/common';
import { PermissionKey, User } from '../../common/types/domain';

@Injectable()
export class PermissionsService {
  has(user: User, permission: PermissionKey): boolean {
    return user.permissions.includes(permission);
  }
}
