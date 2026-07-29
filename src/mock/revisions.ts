import { ArticleRevision } from '../common/types/domain';

export const mockRevisions: ArticleRevision[] = [
  {
    id: 'revision-001',
    articleId: 'article-001',
    editorId: 'user-reviewer',
    note: '补充编辑判断与事实核查说明',
    contentSnapshot: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '生成式 AI 正在进入新闻生产的多个环节，但事实核查与编辑判断仍然不可替代。' }] }],
    },
    createdAt: '2026-07-22T10:30:00.000Z',
  },
];
