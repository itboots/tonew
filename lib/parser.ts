import * as cheerio from 'cheerio';
import { RawItem } from '@/types';

export class ContentParser {
  parse(html: string): RawItem[] {
    const $ = cheerio.load(html);
    const items: RawItem[] = [];

    console.log('开始解析HTML内容...');

    // 尝试多种选择器策略来提取内容
    const strategies = [
      this.parseSimpleHTML.bind(this), // 新增：处理简单HTML页面
      this.parseBlogPosts.bind(this),
      this.parseArticles.bind(this),
      this.parseListItems.bind(this),
      this.parseCards.bind(this),
      this.parseNavigation.bind(this),
      this.parseLinks.bind(this),
      this.parseGenericContent.bind(this), // 新增通用解析策略
    ];

    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i];
      const result = strategy($);
      console.log(`策略 ${i + 1} 解析出 ${result.length} 个条目`);

      if (result.length > 0) {
        items.push(...result);
        break;
      }
    }

    console.log(`总共解析出 ${items.length} 个条目`);
    return items;
  }

  private parseSimpleHTML($: cheerio.Root): RawItem[] {
    const items: RawItem[] = [];

    console.log('尝试解析简单HTML页面...');

    // 检查是否是SPA应用的初始HTML
    const title = $('title').text().trim();
    console.log('页面标题:', title);

    if (title) {
      // 创建一个默认条目，提供网站基本信息
      items.push({
        title: title,
        link: 'https://yucoder.cn',
        description: `这是一个名为"${title}"的网站。这是一个单页应用(SPA)，内容可能需要JavaScript加载才能完全显示。`,
        date: new Date().toISOString().split('T')[0]
      });
    }

    // 查找页面中的任何链接
    const links = $('a[href]');
    console.log(`找到 ${links.length} 个链接`);

    links.each((index, element) => {
      if (index >= 5) return false; // 限制只处理前5个链接

      const $el = $(element);
      const href = $el.attr('href');
      const text = $el.text().trim();

      if (href && !href.startsWith('#') && text && text.length > 2) {
        const fullUrl = this.normalizeUrl(href);
        items.push({
          title: text,
          link: fullUrl,
          description: `页面链接: ${text}`,
          date: undefined
        });
      }
    });

    return items;
  }

  private parseBlogPosts($: cheerio.Root): RawItem[] {
    const items: RawItem[] = [];

    // 查找博客文章相关元素
    const selectors = [
      '.post',
      '.blog-post',
      '.entry',
      '.article',
      '[class*="post"]',
      '[class*="blog"]',
      '[class*="entry"]',
      '.item',
      '.content-item'
    ];

    for (const selector of selectors) {
      $(selector).each((_, element) => {
        const $el = $(element);
        const title = this.extractTitle($el);
        const link = this.extractLink($el);
        const description = this.extractDescription($el);
        const date = this.extractDate($el);

        if (title && title.length > 3) {
          items.push({ title, link: link || '#', description, date });
        }
      });
    }

    return items;
  }

  private parseNavigation($: cheerio.Root): RawItem[] {
    const items: RawItem[] = [];

    // 查找导航菜单中的链接
    $('nav a, .nav a, .menu a, [class*="nav"] a, [class*="menu"] a').each((_, element) => {
      const $el = $(element);
      const title = $el.text().trim();
      const link = $el.attr('href') || '';

      if (title && title.length > 2 && link && !link.startsWith('#')) {
        items.push({
          title,
          link: this.normalizeUrl(link),
          description: `导航链接: ${title}`,
          date: undefined
        });
      }
    });

    return items;
  }

  private parseGenericContent($: cheerio.Root): RawItem[] {
    const items: RawItem[] = [];
    const seenLinks = new Set<string>();

    // 通用策略：查找所有有意义的链接
    $('a[href]').each((_, element) => {
      const $el = $(element);
      const href = $el.attr('href');

      if (!href || seenLinks.has(href)) return;

      // 过滤掉无效链接
      if (href.startsWith('#') || href === 'javascript:void(0)' || href.length < 3) {
        return;
      }

      const title = $el.text().trim() || $el.attr('title') || '';

      if (title && title.length > 3 && title.length < 200) {
        const link = this.normalizeUrl(href);

        // 尝试从周围元素获取描述
        const $parent = $el.closest('div, li, section, article');
        const description = this.extractDescription($parent) ||
                          $parent.find('p, .desc, .summary').first().text().trim() ||
                          `链接到: ${title}`;

        seenLinks.add(href);
        items.push({ title, link, description: description.substring(0, 500) });
      }
    });

    return items;
  }

  private parseArticles($: cheerio.Root): RawItem[] {
    const items: RawItem[] = [];

    $('article').each((_, element) => {
      const $el = $(element);
      const title = this.extractTitle($el);
      const link = this.extractLink($el);
      const description = this.extractDescription($el);
      const date = this.extractDate($el);

      if (title && link) {
        items.push({ title, link, description, date });
      }
    });

    return items;
  }

  private parseListItems($: cheerio.Root): RawItem[] {
    const items: RawItem[] = [];
    
    $('li').each((_, element) => {
      const $el = $(element);
      const title = this.extractTitle($el);
      const link = this.extractLink($el);
      const description = this.extractDescription($el);
      const date = this.extractDate($el);

      if (title && link && title.length > 5) {
        items.push({ title, link, description, date });
      }
    });

    return items;
  }

  private parseCards($: cheerio.Root): RawItem[] {
    const items: RawItem[] = [];
    
    $('.card, .item, .post, .entry, [class*="card"], [class*="item"]').each((_, element) => {
      const $el = $(element);
      const title = this.extractTitle($el);
      const link = this.extractLink($el);
      const description = this.extractDescription($el);
      const date = this.extractDate($el);

      if (title && link) {
        items.push({ title, link, description, date });
      }
    });

    return items;
  }

  private parseLinks($: cheerio.Root): RawItem[] {
    const items: RawItem[] = [];
    const seenLinks = new Set<string>();
    
    $('a[href]').each((_, element) => {
      const $el = $(element);
      const href = $el.attr('href');
      
      if (!href || seenLinks.has(href)) return;
      
      // 过滤导航链接和无效链接
      if (href.startsWith('#') || href === '/' || href.length < 5) return;
      
      const title = this.extractTitle($el) || $el.text().trim();
      const link = this.normalizeUrl(href);
      
      // 尝试从父元素获取更多信息
      const $parent = $el.parent();
      const description = this.extractDescription($parent) || this.extractDescription($el);
      const date = this.extractDate($parent) || this.extractDate($el);

      if (title && title.length > 5 && link) {
        seenLinks.add(href);
        items.push({ title, link, description, date });
      }
    });

    return items;
  }

  private extractTitle($el: any): string {
    // 尝试多种方式提取标题
    let title = '';
    
    title = $el.find('h1, h2, h3, h4, .title, [class*="title"]').first().text().trim();
    if (title) return this.cleanText(title);
    
    title = $el.attr('title') || $el.attr('alt') || '';
    if (title) return this.cleanText(title);
    
    title = $el.text().trim();
    return this.cleanText(title);
  }

  private extractLink($el: any): string {
    let link = '';
    
    link = $el.find('a').first().attr('href') || '';
    if (link) return this.normalizeUrl(link);
    
    link = $el.attr('href') || '';
    return this.normalizeUrl(link);
  }

  private extractDescription($el: any): string {
    let desc = '';
    
    desc = $el.find('p, .description, .summary, [class*="desc"]').first().text().trim();
    if (desc) return this.cleanText(desc);
    
    desc = $el.attr('description') || '';
    if (desc) return this.cleanText(desc);
    
    // 获取文本但排除标题
    const fullText = $el.text().trim();
    const title = this.extractTitle($el);
    desc = fullText.replace(title, '').trim();
    
    return this.cleanText(desc);
  }

  private extractDate($el: any): string | undefined {
    const dateText = $el.find('time, .date, [class*="date"]').first().text().trim();
    if (dateText) return dateText;
    
    const datetime = $el.find('time').attr('datetime');
    if (datetime) return datetime;
    
    return undefined;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim()
      .substring(0, 500);
  }

  private normalizeUrl(url: string): string {
    if (!url) return '';
    
    // 如果是相对路径，添加基础URL
    if (url.startsWith('/')) {
      return `https://yucoder.cn${url}`;
    }
    
    // 如果没有协议，添加https
    if (!url.startsWith('http')) {
      return `https://${url}`;
    }
    
    return url;
  }
}
