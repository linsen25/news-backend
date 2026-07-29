import { AuditLog } from '../common/types/domain';

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-001',
    userId: 'user-author',
    userName: '林作者',
    action: 'SUBMIT_REVIEW',
    articleId: 'article-002',
    description: '提交文章《加拿大公布新一轮数字政策咨询》审核',
    createdAt: '2026-07-25T09:15:00.000Z',
  },
];
