import { ValueItem } from '@/types';

export function getDemoData(): ValueItem[] {
  return [
    {
      id: 'demo1',
      title: 'Vue 3.4 发布：重大性能优化和新特性',
      link: 'https://vuejs.org/blog/2023/12/28/vue-3-4',
      description: 'Vue 3.4 带来了显著的性能提升，包括更快的模板编译、优化的响应式系统，以及新的开发者工具特性。本次更新主要关注性能和开发体验的提升。',
      publishDate: '2023-12-28',
      importance: 9.5,
      scrapedAt: new Date().toISOString()
    },
    {
      id: 'demo2',
      title: 'React Server Components 深度解析',
      link: 'https://react.dev/blog/2023/03/22/react-server-components',
      description: '深入理解 React Server Components 的工作原理、最佳实践以及如何在项目中有效使用这一革命性特性，提升应用性能和用户体验。',
      publishDate: '2023-12-25',
      importance: 9.0,
      scrapedAt: new Date().toISOString()
    },
    {
      id: 'demo3',
      title: 'TypeScript 5.3 新特性全面介绍',
      link: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-3.html',
      description: 'TypeScript 5.3 引入了导入属性、resolution-mode 注释等新特性，进一步提升了类型安全和开发效率。',
      publishDate: '2023-12-20',
      importance: 8.5,
      scrapedAt: new Date().toISOString()
    },
    {
      id: 'demo4',
      title: 'Vite 5.0 发布：下一代构建工具',
      link: 'https://vitejs.dev/blog/announcing-vite5',
      description: 'Vite 5.0 带来了更快的构建速度、更好的开发体验和全新的插件系统。支持最新的 Web 标准，为现代 Web 开发提供强大支持。',
      publishDate: '2023-12-18',
      importance: 9.2,
      scrapedAt: new Date().toISOString()
    },
    {
      id: 'demo5',
      title: 'Next.js 14 App Router 最佳实践',
      link: 'https://nextjs.org/docs/app',
      description: '全面了解 Next.js 14 App Router 的核心概念、布局模式、数据获取策略以及如何构建高性能的全栈应用。',
      publishDate: '2023-12-15',
      importance: 8.8,
      scrapedAt: new Date().toISOString()
    },
    {
      id: 'demo6',
      title: 'AI 前端开发：ChatGPT 辅助编码指南',
      link: 'https://openai.com/blog/chatgpt',
      description: '探索如何使用 ChatGPT 等 AI 工具提升前端开发效率，包括代码生成、调试、重构和最佳实践指导。',
      publishDate: '2023-12-12',
      importance: 8.0,
      scrapedAt: new Date().toISOString()
    },
    {
      id: 'demo7',
      title: 'Tailwind CSS 4.0 Alpha 重大更新',
      link: 'https://tailwindcss.com/blog/tailwindcss-v4-alpha',
      description: 'Tailwind CSS 4.0 带来了全新的引擎、更快的构建速度和更强的定制能力，以及改进的 CSS-in-JS 体验。',
      publishDate: '2023-12-10',
      importance: 7.8,
      scrapedAt: new Date().toISOString()
    },
    {
      id: 'demo8',
      title: 'WebAssembly 在前端的应用实践',
      link: 'https://webassembly.org/',
      description: '深入了解 WebAssembly 如何在前端应用中发挥作用，包括性能优化、计算密集型任务处理以及与 JavaScript 的集成。',
      publishDate: '2023-12-08',
      importance: 8.3,
      scrapedAt: new Date().toISOString()
    },
    {
      id: 'demo9',
      title: '现代 CSS Grid 布局完全指南',
      link: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
      description: '掌握 CSS Grid 的所有特性，从基础概念到高级技巧，构建复杂而灵活的网页布局，告别传统的布局方案。',
      publishDate: '2023-12-05',
      importance: 7.5,
      scrapedAt: new Date().toISOString()
    },
    {
      id: 'demo10',
      title: 'Node.js 性能优化实战技巧',
      link: 'https://nodejs.org/en/docs/guides/simple-profiling/',
      description: '学习 Node.js 应用的性能监控、分析和优化技巧，包括内存管理、事件循环优化和集群部署等高级主题。',
      publishDate: '2023-12-02',
      importance: 8.1,
      scrapedAt: new Date().toISOString()
    },
    {
      id: 'demo11',
      title: 'GraphQL vs REST API 选择指南',
      link: 'https://graphql.org/learn/',
      description: '深入比较 GraphQL 和 REST API 的优缺点，帮助你为项目选择合适的 API 设计方案，提升开发效率和用户体验。',
      publishDate: '2023-11-28',
      importance: 7.7,
      scrapedAt: new Date().toISOString()
    },
    {
      id: 'demo12',
      title: '前端安全：XSS 和 CSRF 防护策略',
      link: 'https://owasp.org/',
      description: '全面了解前端安全威胁和防护措施，包括输入验证、内容安全策略(CSP)、同源策略等安全机制的实现。',
      publishDate: '2023-11-25',
      importance: 8.6,
      scrapedAt: new Date().toISOString()
    }
  ];
}

export function getRandomDemoData(count: number = 8): ValueItem[] {
  const allData = getDemoData();
  // 随机打乱并取指定数量
  const shuffled = [...allData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}