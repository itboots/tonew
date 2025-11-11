import { ValueItem } from '@/types';
import { client as redis } from '@/lib/redis';

/**
 * Redis 中存储已滑掉条目的键名
 */
export const DISMISSED_ITEMS_KEY = 'dismissed_items';

/**
 * 从 Redis 获取已滑掉的条目 ID 列表
 */
export async function getDismissedItemIds(): Promise<string[]> {
  try {
    if (!redis) {
      console.warn('⚠️ Redis 客户端未初始化');
      return [];
    }

    const ids = await redis.smembers(DISMISSED_ITEMS_KEY);
    const dismissedIds = (ids || []) as string[];
    console.log(`🚫 已滑掉的条目数量: ${dismissedIds.length}`);
    return dismissedIds;
  } catch (error) {
    console.warn('⚠️ 获取已滑掉条目失败:', error);
    return [];
  }
}

/**
 * 过滤掉已滑掉的条目
 * @param items 原始条目列表
 * @param dismissedIds 已滑掉的条目 ID 列表
 * @returns 过滤后的条目列表
 */
export function filterDismissedItems(
  items: ValueItem[],
  dismissedIds: string[]
): ValueItem[] {
  if (dismissedIds.length === 0) return items;

  return items.filter(item => {
    // 确保 item.id 是字符串类型
    const itemId = typeof item.id === 'string' ? item.id : String(item.id);
    return !dismissedIds.includes(itemId);
  });
}

/**
 * 格式化数字为易读格式（K, M）
 */
export function formatNumber(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * 格式化时间戳为相对时间
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date().getTime();
  const time = new Date(timestamp).getTime();
  const diff = now - time;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  return `${days}天前`;
}
