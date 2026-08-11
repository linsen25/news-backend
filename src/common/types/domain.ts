export type ArticleStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'rejected'
  | 'published';

export type PermissionKey =
  | 'articles.view.own'
  | 'articles.create'
  | 'articles.edit.own'
  | 'articles.save.draft'
  | 'articles.submit'
  | 'articles.review.view'
  | 'articles.review.decide'
  | 'articles.publish'
  | 'media.view'
  | 'media.upload'
  | 'media.delete'
  | 'users.view'
  | 'users.permissions.manage';

export interface Permission {
  id: string;
  key: PermissionKey;
  module: 'articles.edit' | 'articles.review' | 'media.manage' | 'accounts.manage';
  name: string;
}

export interface Role {
  id: 'role-author' | 'role-reviewer' | 'role-admin';
  name: 'Author' | 'Reviewer' | 'Admin';
  permissionKeys: PermissionKey[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  roleIds: Role['id'][];
  permissions: PermissionKey[];
  avatarUrl?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  categoryId?: string | null;
}

export interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
}

export interface TipTapDocument extends TipTapNode {
  type: 'doc';
  content: TipTapNode[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  content: TipTapDocument;
  coverImage: string;
  byline: string;
  articleDate: string;
  author: Pick<User, 'id' | 'name'>;
  currentEditor: Pick<User, 'id' | 'name'>;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  tags: Tag[];
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  hasPublishedVersion: boolean;
}

export interface ArticleRevision {
  id: string;
  articleId: string;
  editorId: string;
  note: string;
  contentSnapshot: TipTapDocument;
  createdAt: string;
}

export type AuditAction =
  | 'CREATE_ARTICLE'
  | 'UPDATE_ARTICLE'
  | 'SUBMIT_REVIEW'
  | 'APPROVE_ARTICLE'
  | 'REJECT_ARTICLE'
  | 'PUBLISH_ARTICLE'
  | 'DELETE_ARTICLE'
  | 'LOGIN';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  articleId: string | null;
  description: string;
  createdAt: string;
}

export interface ReviewComment {
  id: string;
  articleId: string;
  reviewerId: string;
  reviewerName: string;
  content: string;
  createdAt: string;
}
