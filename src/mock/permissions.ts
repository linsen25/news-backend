import { Permission } from '../common/types/domain';

export const mockPermissions: Permission[] = [
  { id: 'perm-view-own', key: 'articles.view.own', module: 'articles.edit', name: '查看自己的文章' },
  { id: 'perm-create', key: 'articles.create', module: 'articles.edit', name: '创建文章' },
  { id: 'perm-edit-own', key: 'articles.edit.own', module: 'articles.edit', name: '编辑自己的文章' },
  { id: 'perm-save-draft', key: 'articles.save.draft', module: 'articles.edit', name: '保存草稿' },
  { id: 'perm-submit', key: 'articles.submit', module: 'articles.edit', name: '提交审核' },
  { id: 'perm-review-view', key: 'articles.review.view', module: 'articles.review', name: '查看待审核文章' },
  { id: 'perm-review-decide', key: 'articles.review.decide', module: 'articles.review', name: '通过或退回文章' },
  { id: 'perm-publish', key: 'articles.publish', module: 'articles.review', name: '发布审核通过的文章' },
  { id: 'perm-users-view', key: 'users.view', module: 'accounts.manage', name: '查看账号' },
  { id: 'perm-users-manage', key: 'users.permissions.manage', module: 'accounts.manage', name: '管理用户权限' },
];
