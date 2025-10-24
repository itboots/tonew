import { Redis } from '@upstash/redis';
import { ValueItem } from '@/types';

// 纯Redis缓存策略
const REDIS_CACHE_TTL = 900; // 15分钟Redis缓存
const AUTO_UPDATE_INTERVAL = 60000; // 1分钟自动检查更新

// 获取环境变量并提供警告
const getRedisConfig = () => {
  // 支持多种环境变量名称格式
  const url = process.env.UPSTASH_REDIS_REST_URL ||
              process.env.UPSTASH_REDIS_URL ||
              process.env.REDIS_URL;

  const token = process.env.UPSTASH_REDIS_REST_TOKEN ||
                process.env.UPSTASH_REDIS_TOKEN ||
                process.env.REDIS_TOKEN;

  if (!url || !token) {
    // 静态构建阶段不输出警告
    if (process.env.NEXT_PHASE !== 'phase-production-build' && !process.env.NEXT_PUBLIC_VERCEL_ENV) {
      console.warn('⚠️ Redis 配置缺失:', {
        url: url ? '已配置' : '未配置',
        token: token ? '已配置' : '未配置',
        envKeys: {
          UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
          UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
          UPSTASH_REDIS_URL: !!process.env.UPSTASH_REDIS_URL,
          UPSTASH_REDIS_TOKEN: !!process.env.UPSTASH_REDIS_TOKEN,
          REDIS_URL: !!process.env.REDIS_URL,
          REDIS_TOKEN: !!process.env.REDIS_TOKEN,
        },
        buildPhase: process.env.NEXT_PHASE || 'unknown'
      });
    }
    return null;
  }

  return { url, token };
};

// 初始化 Upstash Redis 客户端
const redisConfig = getRedisConfig();
const redis = redisConfig ? new Redis({
  url: redisConfig.url,
  token: redisConfig.token,
}) : null;

// 检查Redis客户端是否可用
export const isRedisAvailable = (): boolean => {
  return redis !== null;
};

// 缓存键常量
export const CACHE_KEYS = {
  SCRAPER_DATA: 'scraper:data',
  LAST_UPDATE: 'scraper:last_update',
  UPDATE_COUNT: 'scraper:update_count',
  FORCE_REFRESH: 'scraper:force_refresh',
} as const;

// 缓存过期时间（秒）
export const CACHE_TTL = {
  DATA: REDIS_CACHE_TTL, // 15分钟
  META: REDIS_CACHE_TTL, // 15分钟
} as const;

export interface CacheData {
  items: ValueItem[];
  lastUpdate: string;
  updateCount: number;
}

export class RedisCache {
  /**
   * 从Redis获取分页数据（普通刷新使用）
   */
  static async getPagedData(page: number = 1, pageSize: number = 20): Promise<{
    items: ValueItem[];
    total: number;
    hasMore: boolean;
    lastUpdate: string | null;
  }> {
    try {
      if (!redis) {
        console.warn('⚠️ Redis客户端未初始化，返回空数据');
        return { items: [], total: 0, hasMore: false, lastUpdate: null };
      }

      const data = await redis.get<CacheData>(CACHE_KEYS.SCRAPER_DATA);
      if (!data) {
        return { items: [], total: 0, hasMore: false, lastUpdate: null };
      }

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedItems = data.items.slice(startIndex, endIndex);

      console.log(`📖 Redis分页读取 (页${page}, ${paginatedItems.length}条)`);

      return {
        items: paginatedItems,
        total: data.items.length,
        hasMore: endIndex < data.items.length,
        lastUpdate: data.lastUpdate,
      };
    } catch (error) {
      console.error('❌ Redis分页读取失败:', error);
      return { items: [], total: 0, hasMore: false, lastUpdate: null };
    }
  }

  /**
   * 检查是否需要自动更新（定时器使用）
   */
  static async shouldAutoUpdate(): Promise<boolean> {
    try {
      if (!redis) {
        console.warn('⚠️ Redis客户端未初始化，跳过自动更新检查');
        return false;
      }

      const lastUpdate = await this.getLastUpdate();
      if (!lastUpdate) return true;

      const lastUpdateTime = new Date(lastUpdate).getTime();
      const now = new Date().getTime();
      const diffMinutes = (now - lastUpdateTime) / (1000 * 60);

      // 超过1分钟需要更新
      return diffMinutes > 1;
    } catch (error) {
      console.error('❌ 检查自动更新失败:', error);
      return true;
    }
  }

  /**
   * 存储数据到Redis（强制刷新和定时器使用）
   */
  static async storeData(items: ValueItem[], forceRefresh: boolean = false): Promise<void> {
    try {
      if (!redis) {
        console.warn('⚠️ Redis客户端未初始化，跳过数据存储');
        return;
      }

      const now = new Date().toISOString();
      const updateCount = forceRefresh ?
        await this.getUpdateCount() + 1 :
        await this.getUpdateCount();

      const cacheData: CacheData = {
        items,
        lastUpdate: now,
        updateCount,
      };

      // 存储主要数据
      await redis.set(CACHE_KEYS.SCRAPER_DATA, cacheData, {
        ex: REDIS_CACHE_TTL,
      });

      // 存储元数据
      await redis.set(CACHE_KEYS.LAST_UPDATE, now, {
        ex: REDIS_CACHE_TTL,
      });

      await redis.set(CACHE_KEYS.UPDATE_COUNT, updateCount, {
        ex: REDIS_CACHE_TTL,
      });

      // 清除强制刷新标记
      if (forceRefresh) {
        await redis.del(CACHE_KEYS.FORCE_REFRESH);
      }

      const action = forceRefresh ? '强制刷新' : '定时更新';
      console.log(`✅ ${action}完成 (${items.length}条, 更新次数: ${updateCount})`);
    } catch (error) {
      console.error('❌ Redis数据存储失败:', error);
      throw error;
    }
  }

  /**
   * 存储爬取数据到 Redis
   */
  static async setData(items: ValueItem[], forceRefresh: boolean = false): Promise<void> {
    try {
      if (!redis) {
        console.warn('⚠️ Redis客户端未初始化，跳过数据缓存');
        return;
      }

      const now = new Date().toISOString();
      const updateCount = forceRefresh ?
        await this.getUpdateCount() + 1 :
        await this.getUpdateCount();

      // 存储主要数据
      await redis.set(CACHE_KEYS.SCRAPER_DATA, {
        items,
        lastUpdate: now,
        updateCount,
      }, {
        ex: CACHE_TTL.DATA,
      });

      // 存储元数据
      await redis.set(CACHE_KEYS.LAST_UPDATE, now, {
        ex: CACHE_TTL.META,
      });

      await redis.set(CACHE_KEYS.UPDATE_COUNT, updateCount, {
        ex: CACHE_TTL.META,
      });

      // 清除强制刷新标记
      if (forceRefresh) {
        await redis.del(CACHE_KEYS.FORCE_REFRESH);
      }

      console.log(`✅ 数据已缓存到 Redis (更新次数: ${updateCount}, 强制刷新: ${forceRefresh})`);
    } catch (error) {
      console.error('❌ Redis 缓存写入失败:', error);
      throw error;
    }
  }

  /**
   * 从 Redis 获取缓存数据
   */
  static async getData(): Promise<CacheData | null> {
    try {
      if (!redis) {
        return null;
      }
      const data = await redis.get<CacheData>(CACHE_KEYS.SCRAPER_DATA);
      return data;
    } catch (error) {
      console.error('❌ Redis 缓存读取失败:', error);
      return null;
    }
  }

  /**
   * 获取最后更新时间
   */
  static async getLastUpdate(): Promise<string | null> {
    try {
      if (!redis) {
        return null;
      }
      return await redis.get<string>(CACHE_KEYS.LAST_UPDATE);
    } catch (error) {
      console.error('❌ 获取最后更新时间失败:', error);
      return null;
    }
  }

  /**
   * 获取更新次数
   */
  static async getUpdateCount(): Promise<number> {
    try {
      if (!redis) {
        return 0;
      }
      const count = await redis.get<number>(CACHE_KEYS.UPDATE_COUNT);
      return count || 0;
    } catch (error) {
      console.error('❌ 获取更新次数失败:', error);
      return 0;
    }
  }

  /**
   * 设置强制刷新标记
   */
  static async setForceRefresh(): Promise<void> {
    try {
      if (!redis) {
        console.warn('⚠️ Redis客户端未初始化，跳过设置强制刷新标记');
        return;
      }

      await redis.set(CACHE_KEYS.FORCE_REFRESH, 'true', {
        ex: 60, // 1分钟后过期
      });
      console.log('🔄 已设置强制刷新标记');
    } catch (error) {
      console.error('❌ 设置强制刷新标记失败:', error);
    }
  }

  /**
   * 检查是否需要强制刷新
   */
  static async shouldForceRefresh(): Promise<boolean> {
    try {
      if (!redis) {
        return false;
      }
      const flag = await redis.get<string>(CACHE_KEYS.FORCE_REFRESH);
      return flag === 'true';
    } catch (error) {
      console.error('❌ 检查强制刷新标记失败:', error);
      return false;
    }
  }

  /**
   * 检查缓存是否有效（15分钟内）
   */
  static async isCacheValid(): Promise<boolean> {
    try {
      const lastUpdate = await this.getLastUpdate();
      if (!lastUpdate) return false;

      const lastUpdateTime = new Date(lastUpdate).getTime();
      const now = new Date().getTime();
      const diffMinutes = (now - lastUpdateTime) / (1000 * 60);

      // 缓存15分钟内有效
      return diffMinutes < 15;
    } catch (error) {
      console.error('❌ 检查缓存有效性失败:', error);
      return false;
    }
  }

  /**
   * 清除所有缓存
   */
  static async clearCache(): Promise<void> {
    try {
      if (!redis) {
        console.warn('⚠️ Redis客户端未初始化，跳过清除缓存');
        return;
      }

      await Promise.all([
        redis.del(CACHE_KEYS.SCRAPER_DATA),
        redis.del(CACHE_KEYS.LAST_UPDATE),
        redis.del(CACHE_KEYS.UPDATE_COUNT),
        redis.del(CACHE_KEYS.FORCE_REFRESH),
      ]);
      console.log('🗑️ 已清除所有缓存');
    } catch (error) {
      console.error('❌ 清除缓存失败:', error);
    }
  }

  /**
   * 获取缓存统计信息
   */
  static async getCacheStats(): Promise<{
    hasData: boolean;
    lastUpdate: string | null;
    updateCount: number;
    isForceRefresh: boolean;
    isValid: boolean;
  }> {
    const data = await this.getData();
    const lastUpdate = await this.getLastUpdate();
    const updateCount = await this.getUpdateCount();
    const isForceRefresh = await this.shouldForceRefresh();
    const isValid = await this.isCacheValid();

    return {
      hasData: !!data,
      lastUpdate,
      updateCount,
      isForceRefresh,
      isValid,
    };
  }
}