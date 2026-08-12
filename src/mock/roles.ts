import { Role } from '../common/types/domain';

export const mockRoles: Role[] = [
  {
    id: 'role-author',
    name: 'Author',
    permissionKeys: [
      'articles.view.own', 'articles.create', 'articles.edit.own',
      'articles.save.draft', 'articles.submit', 'articles.review.view',
      'media.view', 'media.upload', 'media.delete', 'users.view',
      'homepage.view',
    ],
  },
  {
    id: 'role-reviewer',
    name: 'Reviewer',
    permissionKeys: [
      'articles.review.view', 'articles.review.decide', 'media.view', 'users.view',
      'homepage.view',
    ],
  },
  {
    id: 'role-admin',
    name: 'Admin',
    permissionKeys: [
      'articles.view.own', 'articles.create', 'articles.edit.own',
      'articles.save.draft', 'articles.submit', 'articles.review.view',
      'articles.review.decide', 'articles.publish', 'articles.withdraw', 'media.view',
      'media.upload', 'media.delete', 'users.view', 'users.permissions.manage',
      'homepage.view', 'homepage.manage',
    ],
  },
];
