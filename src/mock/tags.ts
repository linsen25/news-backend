import { Tag } from '../common/types/domain';

export const mockTags: Tag[] = [
  { id: 'tag-immigration', name: '移民政策', slug: 'immigration-policy', categoryId: 'cat-ca' },
  { id: 'tag-education', name: '留学教育', slug: 'study-education', categoryId: 'cat-ca' },
  { id: 'tag-global', name: '全球观察', slug: 'global-watch', categoryId: 'cat-world' },
  { id: 'tag-diplomacy', name: '外交动态', slug: 'diplomacy', categoryId: 'cat-world' },
  { id: 'tag-openai', name: '人工智能', slug: 'artificial-intelligence', categoryId: 'cat-tech' },
  { id: 'tag-digital', name: '数字产业', slug: 'digital-industry', categoryId: 'cat-tech' },
  { id: 'tag-market', name: '市场趋势', slug: 'market-trends', categoryId: 'cat-business' },
  { id: 'tag-enterprise', name: '企业创新', slug: 'enterprise-innovation', categoryId: 'cat-business' },
  { id: 'tag-community', name: '华人社区', slug: 'chinese-community', categoryId: 'cat-society' },
  { id: 'tag-city', name: '城市生活', slug: 'city-life', categoryId: 'cat-society' },
];
