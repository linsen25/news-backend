import { PrismaService } from '../src/infrastructure/database/prisma.service';

type DemoArticle = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  byline: string;
  articleDate: string;
  categoryId: string;
  tagId: string;
  coverImage: string;
  paragraphs: string[];
};

const articles: DemoArticle[] = [
  {
    id: 'demo-immigration-2026', title: '加拿大更新新移民社区安置服务指引', slug: 'canada-newcomer-settlement-services-2026',
    summary: '新版指引聚焦语言支持、就业衔接和社区服务，让新移民更快找到适合自己的公共资源。', byline: '中加网记者 林远', articleDate: '2026-08-11T14:00:00.000Z',
    categoryId: 'cat-ca', tagId: 'tag-immigration', coverImage: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=1400&q=85',
    paragraphs: ['加拿大多个城市近期更新新移民安置服务指引，将语言培训、就业辅导和社区融入纳入统一服务入口。', '新指引鼓励公共机构与社区组织共享信息，减少申请人在不同部门之间重复提交材料的情况。', '相关服务将分阶段上线，各地居民可通过所在城市公共服务网站查询具体安排。'],
  },
  {
    id: 'demo-education-2026', title: '加拿大高校扩大国际学生就业辅导项目', slug: 'canadian-universities-expand-career-support',
    summary: '多所高校把职业规划、实习资源和毕业后就业政策说明整合到国际学生支持体系中。', byline: '中加网教育观察员 周宁', articleDate: '2026-08-10T15:30:00.000Z',
    categoryId: 'cat-ca', tagId: 'tag-education', coverImage: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1400&q=85',
    paragraphs: ['加拿大高校正在扩大面向国际学生的就业辅导服务，重点覆盖简历准备、实习申请和本地职场沟通。', '部分学校还与企业和校友网络合作，为学生提供行业讲座及短期实践机会。', '教育人士建议学生尽早了解课程安排与就业政策，并通过校内正式渠道确认最新信息。'],
  },
  {
    id: 'demo-global-2026', title: '全球主要经济体加快布局清洁能源合作', slug: 'global-clean-energy-cooperation-2026',
    summary: '从关键矿产到绿色金融，多边合作正在成为推动能源转型的重要抓手。', byline: '中加网国际部 陈序', articleDate: '2026-08-09T13:00:00.000Z',
    categoryId: 'cat-world', tagId: 'tag-global', coverImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1400&q=85',
    paragraphs: ['全球主要经济体近期密集讨论清洁能源供应链、关键矿产和绿色金融合作。', '分析认为，技术标准与投资规则的协调将直接影响新能源项目的落地速度。', '未来一段时间，多边机制能否兼顾转型效率与发展差异，将成为政策讨论的重点。'],
  },
  {
    id: 'demo-diplomacy-2026', title: '中加青年交流项目开启新一轮报名', slug: 'china-canada-youth-exchange-registration',
    summary: '项目将通过校园访问、城市考察和文化活动，为两国青年提供面对面的交流机会。', byline: '中加网特约记者 顾言', articleDate: '2026-08-08T16:00:00.000Z',
    categoryId: 'cat-world', tagId: 'tag-diplomacy', coverImage: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=85',
    paragraphs: ['新一轮中加青年交流项目近日启动报名，活动内容包括校园访问、主题研讨和城市文化体验。', '主办方希望参与者在真实场景中了解彼此社会，并围绕教育、创新与可持续发展展开对话。', '项目计划分批举行，具体行程和申请条件将由承办机构陆续公布。'],
  },
  {
    id: 'demo-ai-2026', title: '加拿大企业加速测试生成式人工智能工具', slug: 'canadian-businesses-test-generative-ai-tools',
    summary: '越来越多企业把生成式人工智能用于客户服务和内部知识管理，同时强化人工复核。', byline: '中加网科技记者 许川', articleDate: '2026-08-07T14:30:00.000Z',
    categoryId: 'cat-tech', tagId: 'tag-openai', coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=85',
    paragraphs: ['加拿大企业正把生成式人工智能引入客户服务、文档整理和内部知识检索等场景。', '受访企业表示，试点阶段最重要的工作是明确数据边界，并保留关键决定的人工复核环节。', '行业人士预计，围绕模型透明度、版权和数据安全的治理投入还会继续增加。'],
  },
  {
    id: 'demo-digital-2026', title: '加拿大公布新一轮数字政策咨询', slug: 'canada-digital-policy-consultation-2026',
    summary: '公众咨询围绕数字服务透明度、创新环境和个人信息保护展开。', byline: '中加网加拿大通讯员 沈安', articleDate: '2026-08-06T12:00:00.000Z',
    categoryId: 'cat-tech', tagId: 'tag-digital', coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=85',
    paragraphs: ['加拿大相关部门启动新一轮数字政策公众咨询，邀请产业机构、研究人员和公众提交意见。', '本轮讨论重点包括平台透明度、数字身份、数据使用规则以及中小企业创新环境。', '咨询结果将用于后续政策评估，正式安排仍以政府部门公布的信息为准。'],
  },
  {
    id: 'demo-market-2026', title: '加拿大消费市场呈现温和复苏迹象', slug: 'canada-consumer-market-recovery-signals',
    summary: '零售和服务业活动有所回暖，但家庭仍然关注生活成本和利率变化。', byline: '中加网财经编辑 韩清', articleDate: '2026-08-05T13:20:00.000Z',
    categoryId: 'cat-business', tagId: 'tag-market', coverImage: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=1400&q=85',
    paragraphs: ['近期市场数据释放出加拿大消费活动温和复苏的信号，部分零售与服务行业客流有所增加。', '不过，住房和日常生活成本仍然影响家庭支出选择，消费者更重视价格和长期价值。', '分析人士认为，未来走势还需观察就业、利率和居民信心的共同变化。'],
  },
  {
    id: 'demo-enterprise-2026', title: '中加创新企业探索跨境合作新模式', slug: 'china-canada-startups-cross-border-cooperation',
    summary: '科技企业通过联合研发、本地化服务和产业伙伴关系寻找更稳健的跨境增长路径。', byline: '中加网商业观察员 罗启', articleDate: '2026-08-04T15:00:00.000Z',
    categoryId: 'cat-business', tagId: 'tag-enterprise', coverImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85',
    paragraphs: ['来自中国和加拿大的创新企业正在探索联合研发、渠道合作和本地化服务等合作模式。', '企业代表表示，跨境项目需要在市场需求、合规要求和知识产权安排之间建立清晰边界。', '稳定的本地伙伴关系和持续沟通，被视为降低项目执行风险的重要基础。'],
  },
  {
    id: 'demo-community-2026', title: '多伦多华人社区举办夏季公益文化活动', slug: 'toronto-chinese-community-summer-event',
    summary: '活动集合文化体验、社区服务咨询和公益义卖，吸引不同年龄层居民参与。', byline: '中加网社区记者 唐月', articleDate: '2026-08-03T17:00:00.000Z',
    categoryId: 'cat-society', tagId: 'tag-community', coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85',
    paragraphs: ['多伦多华人社区近日举行夏季公益文化活动，现场设置传统文化体验、公共服务咨询和公益义卖。', '主办方邀请多个社区组织共同参与，希望帮助新居民更方便地了解本地生活资源。', '活动也为不同文化背景的居民提供交流空间，后续还将推出面向家庭的系列项目。'],
  },
  {
    id: 'demo-city-2026', title: '温哥华推出社区公共空间改善计划', slug: 'vancouver-community-public-space-plan',
    summary: '计划将改善步行环境、街区绿化和休憩设施，并邀请居民参与方案讨论。', byline: '中加网城市观察员 叶舟', articleDate: '2026-08-02T16:30:00.000Z',
    categoryId: 'cat-society', tagId: 'tag-city', coverImage: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=1400&q=85',
    paragraphs: ['温哥华公布社区公共空间改善计划，将分阶段优化步行环境、街区绿化和休憩设施。', '城市规划团队将通过线上问卷和社区会议收集意见，并根据不同街区的实际使用需求调整方案。', '首批项目预计在完成设计与评估后启动，施工期间会保留必要的通行安排。'],
  },
];

const toContent = (paragraphs: string[]) => ({
  type: 'doc',
  content: paragraphs.map((text) => ({ type: 'paragraph', content: [{ type: 'text', text }] })),
});

async function seedDemoArticles() {
  const prisma = new PrismaService();
  await prisma.$connect();
  const editor = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!editor) throw new Error('请先运行 npm run db:seed 创建基础用户。');

  for (const article of articles) {
    const content = toContent(article.paragraphs);
    await prisma.$transaction(async (tx) => {
      await tx.article.upsert({
        where: { id: article.id },
        update: {
          title: article.title, slug: article.slug, summary: article.summary,
          metaTitle: `${article.title}｜中加网`, metaDescription: article.summary,
          keywords: [], content, coverImage: article.coverImage, byline: article.byline,
          articleDate: new Date(article.articleDate), categoryId: article.categoryId,
          status: 'PUBLISHED', publishedAt: new Date(article.articleDate), publishedSlug: article.slug,
          authorId: editor.id, currentEditorId: editor.id,
        },
        create: {
          id: article.id, title: article.title, slug: article.slug, summary: article.summary,
          metaTitle: `${article.title}｜中加网`, metaDescription: article.summary,
          keywords: [], content, coverImage: article.coverImage, byline: article.byline,
          articleDate: new Date(article.articleDate), categoryId: article.categoryId,
          status: 'PUBLISHED', publishedAt: new Date(article.articleDate), publishedSlug: article.slug,
          authorId: editor.id, currentEditorId: editor.id,
        },
      });
      await tx.articleTag.deleteMany({ where: { articleId: article.id } });
      await tx.articleTag.create({ data: { articleId: article.id, tagId: article.tagId } });
    });
  }

  await prisma.$disconnect();
  console.log(`已初始化 ${articles.length} 篇分类标签示例文章。`);
}

seedDemoArticles().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
