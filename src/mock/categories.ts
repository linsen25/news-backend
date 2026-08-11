import { Category } from '../common/types/domain';

export const mockCategories: Category[] = [
  { id: 'cat-ca', name: '加拿大', nameEn: 'Canada', slug: 'canada', parentId: null },
  { id: 'cat-world', name: '国际', nameEn: 'International', slug: 'world', parentId: null },
  { id: 'cat-tech', name: '科技', nameEn: 'Technology', slug: 'technology', parentId: null },
  { id: 'cat-business', name: '财经', nameEn: 'Business', slug: 'business', parentId: null },
  { id: 'cat-society', name: '社会', nameEn: 'Society', slug: 'society', parentId: null },
];
