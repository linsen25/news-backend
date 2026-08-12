import { User } from '../common/types/domain';

export const mockUsers: User[] = [
  {
    id: 'user-admin',
    name: '系统管理员',
    email: 'admin@example.com',
    passwordHash: '$2b$10$4N6pMYpmGsVTGVtil7y0XOGIupwVhZLQfGM.PwN7MPhQGDE5PGsti',
    roleIds: ['role-admin'],
    permissions: [
      'articles.view.own', 'articles.create', 'articles.edit.own',
      'articles.save.draft', 'articles.submit', 'articles.review.view',
      'articles.review.decide', 'articles.publish', 'users.view',
      'media.view', 'media.upload', 'media.delete', 'users.permissions.manage',
      'homepage.view', 'homepage.manage',
    ],
    createdAt: '2026-07-01T08:00:00.000Z',
  },
  {
    id: 'user-reviewer',
    name: '陈审核',
    email: 'reviewer@example.com',
    passwordHash: '$2b$10$4N6pMYpmGsVTGVtil7y0XOGIupwVhZLQfGM.PwN7MPhQGDE5PGsti',
    roleIds: ['role-reviewer'],
    permissions: ['articles.review.view', 'articles.review.decide', 'media.view', 'users.view', 'homepage.view'],
    createdAt: '2026-07-02T08:00:00.000Z',
  },
  {
    id: 'user-author',
    name: '林作者',
    email: 'author@example.com',
    passwordHash: '$2b$10$4N6pMYpmGsVTGVtil7y0XOGIupwVhZLQfGM.PwN7MPhQGDE5PGsti',
    roleIds: ['role-author'],
    permissions: [
      'articles.view.own', 'articles.create', 'articles.edit.own',
      'articles.save.draft', 'articles.submit', 'articles.review.view',
      'media.view', 'media.upload', 'media.delete', 'users.view',
      'homepage.view',
    ],
    createdAt: '2026-07-03T08:00:00.000Z',
  },
];
