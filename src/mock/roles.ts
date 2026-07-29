import { Role } from '../common/types/domain';

export const mockRoles: Role[] = [
  {
    id: 'role-author',
    name: 'Author',
    permissionKeys: [
      'articles.view.own',
      'articles.create',
      'articles.edit.own',
      'articles.save.draft',
      'articles.submit',
    ],
  },
  {
    id: 'role-reviewer',
    name: 'Reviewer',
    permissionKeys: ['articles.review.view', 'articles.review.decide'],
  },
  {
    id: 'role-admin',
    name: 'Admin',
    permissionKeys: [
      'articles.view.own',
      'articles.create',
      'articles.edit.own',
      'articles.save.draft',
      'articles.submit',
      'articles.review.view',
      'articles.review.decide',
      'articles.publish',
      'users.view',
      'users.permissions.manage',
    ],
  },
];
