import { Category } from '../common/types/domain';

export const mockCategories: Category[] = [
  { id: 'cat-news', name: '新闻', slug: 'news', parentId: null },
  { id: 'cat-world', name: '国际', slug: 'world', parentId: 'cat-news' },
  { id: 'cat-ca', name: '加拿大', slug: 'canada', parentId: 'cat-world' },
  { id: 'cat-us', name: '美国', slug: 'united-states', parentId: 'cat-world' },
  { id: 'cat-tech', name: '科技', slug: 'technology', parentId: 'cat-news' },
  { id: 'cat-ai', name: 'AI', slug: 'ai', parentId: 'cat-tech' },
  { id: 'cat-software', name: '软件', slug: 'software', parentId: 'cat-tech' },
];
