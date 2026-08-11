import { Category } from '../common/types/domain';

export const mockCategories: Category[] = [
  { id: 'cat-ca', name: '加拿大', slug: 'canada', parentId: null },
  { id: 'cat-world', name: '国际', slug: 'world', parentId: null },
  { id: 'cat-tech', name: '科技', slug: 'technology', parentId: null },
  { id: 'cat-business', name: '财经', slug: 'business', parentId: null },
  { id: 'cat-society', name: '社会', slug: 'society', parentId: null },
];
