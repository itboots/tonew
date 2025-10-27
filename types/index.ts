// 有价值的条目
export interface ValueItem {
  id: string;
  title: string;
  link: string;
  description: string;
  publishDate?: string;
  category?: string;
  importance: number;
  hotness?: number; // 原始热度数据 (followerCount)
  scrapedAt: string;
  fullContent?: string; // 展开时显示的完整内容
  isExpanded?: boolean; // 展开状态
  expandedHeight?: number; // 展开后的高度
}

// 原始条目
export interface RawItem {
  title: string;
  link: string;
  description: string;
  date?: string;
  rawHtml?: string;
}

// API 响应
export interface ScrapeResponse {
  success: boolean;
  data?: ValueItem[];
  error?: string;
  timestamp: string;
  metadata?: {
    forceRefresh?: boolean;
    itemCount?: number;
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
    lastUpdate?: string | null;
    shouldUpdate?: boolean;
  };
}

// 错误类型
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INVALID_DATA = 'INVALID_DATA',
}

// 应用错误
export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
}

// 解析器配置
export interface ParserConfig {
  selectors: {
    container: string;
    title: string;
    link: string;
    description: string;
    date: string;
  };
}

// 筛选规则
export interface FilterRules {
  minTitleLength: number;
  minDescriptionLength: number;
  requireLink: boolean;
  excludeKeywords: string[];
  priorityKeywords: string[];
}
