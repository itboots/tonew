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

// 用户相关类型
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  categories: string[];
  notifications: boolean;
  theme: 'apple' | 'cyberpunk';
  autoRefresh: boolean;
}

// 收藏相关
export interface FavoriteItem extends ValueItem {
  itemId: string; // 原始 item_id
  userId: string;
  favoritedAt: string;
  tags?: string[];
  notes?: string;
}

// 标签相关
export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  itemCount?: number;
}

// 通知相关
export interface Notification {
  id: string;
  userId: string;
  type: 'new_content' | 'favorite_tag' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

// API 响应扩展
export interface UserApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
