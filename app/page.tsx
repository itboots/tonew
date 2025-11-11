'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ValueItem, ScrapeResponse } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ContentList from '@/components/ContentList';
import UserHeader from '@/components/UserHeader';
import NotificationCenter from '@/components/NotificationCenter';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';

interface CacheStatus {
  hasData: boolean;
  lastUpdate: string | null;
  updateCount: number;
  isForceRefresh: boolean;
  isValid: boolean;
}

export default function Home() {
  const [items, setItems] = useState<ValueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);

  // 分类数据缓存
  const categoryCache = useRef<Map<string | null, ValueItem[]>>(new Map());

  // 电脑端：按分类分组的数据
  const [categoryGroupedData, setCategoryGroupedData] = useState<Map<string, ValueItem[]>>(new Map());

  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<ValueItem[]>([]);

  // 下拉刷新相关状态
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 搜索过滤
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = items.filter(item =>
      item.title.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query))
    );

    setFilteredItems(filtered);
  }, [searchQuery, items]);

  // 搜索处理
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // 获取分类显示信息（复制自 CategoryFilter）
  const getCategoryDisplay = (category: string) => {
    const categoryMap: { [key: string]: { name: string; icon: string } } = {
      '知乎热榜': { name: '知乎', icon: '📚' },
      '微博热搜': { name: '微博', icon: '🔥' },
      '抖音热搜': { name: '抖音', icon: '🎵' },
      'B站热门': { name: 'B站', icon: '📺' },
      '虎扑步行街热榜': { name: '虎扑', icon: '⚽' },
      '百度贴吧热榜': { name: '贴吧', icon: '💬' },
      '编程热门': { name: '编程', icon: '💻' },
      'CSDN热榜': { name: 'CSDN', icon: '👨‍💻' },
      '掘金热榜': { name: '掘金', icon: '⛏️' },
      '网易云热歌榜': { name: '网易云', icon: '🎶' },
      'QQ音乐热歌榜': { name: 'QQ', icon: '🎵' },
      '什么值得买热榜': { name: '值得买', icon: '🛒' },
      '直播吧体育热榜': { name: '体育', icon: '🏀' },
    };

    return categoryMap[category] || { name: category, icon: '📰' };
  };

  const fetchCacheStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/cache-status');
      const data = await response.json();

      if (data.success && data.data) {
        setCacheStatus(data.data);
      }
    } catch (error) {
      console.error('获取缓存状态失败:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.success && data.data) {
        setAvailableCategories(data.data);
        console.log('📋 获取到分类列表:', data.data.length, '个分类');
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
    }
  }, []);

  const fetchContent = useCallback(async (forceRefresh: boolean = false, page: number = 1) => {
    // 只有首次加载或强制刷新时显示 loading
    if (page === 1 && !categoryCache.current.has(selectedCategory)) {
      setLoading(true);
      setError(null);
    }

    try {
      const pageSize = 20;

      // 检测是否为电脑端（md 断点 768px）
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

      if (!isMobile && page === 1 && !selectedCategory) {
        // 电脑端：并发加载所有分类数据，按分类分组
        console.log('🖥️ 电脑端：并发加载所有分类数据');

        // 先加载分类列表（如果没有）
        let categoriesToLoad = availableCategories;
        if (categoriesToLoad.length === 0) {
          try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            if (data.success && data.data) {
              categoriesToLoad = data.data;
            }
          } catch (error) {
            console.error('获取分类列表失败:', error);
          }
        }

        // 并发请求所有分类的数据
        const promises = categoriesToLoad.map(async (category) => {
          const params = new URLSearchParams({
            page: '1',
            pageSize: '10', // 每个分类只显示前10条
            category: encodeURIComponent(category)
          });

          if (forceRefresh) {
            params.append('refresh', 'true');
          }

          try {
            const response = await fetch(`/api/scrape?${params.toString()}`);
            const data = await response.json();
            return {
              category,
              data: data.success ? data.data : []
            };
          } catch (error) {
            console.error(`加载分类 ${category} 失败:`, error);
            return {
              category,
              data: []
            };
          }
        });

        // 等待所有请求完成
        const results = await Promise.all(promises);

        // 构建分类分组数据
        const groupedData = new Map<string, ValueItem[]>();
        results.forEach(({ category, data }) => {
          if (data.length > 0) {
            groupedData.set(category, data);
          }
        });

        setCategoryGroupedData(groupedData);
        setHasMore(false); // 电脑端不支持分页

        if (forceRefresh) {
          await fetchCacheStatus();
        }
      } else {
        // 移动端或有分类筛选：单个请求
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });

        if (forceRefresh) {
          params.append('refresh', 'true');
        }

        if (selectedCategory) {
          params.append('category', encodeURIComponent(selectedCategory));
        }

        const url = `/api/scrape?${params.toString()}`;
        const response = await fetch(url);
        const data: ScrapeResponse = await response.json();

        if (data.success && data.data) {
          if (page === 1) {
            setItems(data.data);
            setCurrentPage(1);
            // 更新缓存
            categoryCache.current.set(selectedCategory, data.data);
          } else {
            setItems(prev => [...prev, ...(data.data || [])]);
          }

          setTotalItems(data.metadata?.total || data.data.length);
          setHasMore(data.data.length === pageSize);

          if (forceRefresh || data.metadata?.forceRefresh) {
            await fetchCacheStatus();
          }
        } else {
          setError(data.error || '获取内容失败');
        }
      }
    } catch (err) {
      setError('网络请求失败，请检查连接');
    } finally {
      if (page === 1) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [fetchCacheStatus, selectedCategory, availableCategories]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContent(true, 1);
  };

  // 下拉刷新处理
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (refreshing || loading) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    // 只在顶部且向下拉时响应
    if (window.scrollY === 0 && deltaY > 0) {
      setIsPulling(true);
      // 添加阻尼效果
      const damping = 0.5;
      const distance = Math.min(deltaY * damping, 120);
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    const threshold = 60;
    if (pullDistance > threshold) {
      // 触发刷新
      await handleRefresh();
    }

    setIsPulling(false);
    setPullDistance(0);
    touchStartY.current = 0;
  };

  // 处理分类过滤
  const handleCategoryChange = useCallback((category: string | null) => {
    console.log(`🔄 切换分类: ${category || '全部'}`);
    setSelectedCategory(category);
    setCurrentPage(1); // 重置页码
    setHasMore(true); // 重置加载更多状态

    // 乐观更新：先显示缓存数据（如果有）
    const cachedData = categoryCache.current.get(category);
    if (cachedData && cachedData.length > 0) {
      setItems(cachedData);
      console.log(`✨ 使用缓存数据，共 ${cachedData.length} 条`);
    }

    // 后台加载最新数据
    fetchContent(false, 1);
  }, [fetchContent]);

  // 处理滑动删除
  const handleDismiss = useCallback(async (itemId: string) => {
    console.log(`🗑️ 滑掉条目: ${itemId}`);

    // 从本地列表中移除
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));

    // 调用API记录到Redis
    try {
      const response = await fetch('/api/dismiss-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ 条目 ${itemId} 已记录为已滑掉`);
      } else {
        console.error('❌ 记录失败:', data.error);
      }
    } catch (error) {
      console.error('❌ 调用API失败:', error);
    }
  }, []);
  
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || loadingMoreRef.current) return;
    const nextPage = currentPage + 1;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      await fetchContent(false, nextPage);
      setCurrentPage(nextPage);
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [currentPage, fetchContent, hasMore, loading]);

  // 初始化：仅在组件挂载时执行一次
  useEffect(() => {
    fetchCategories();
    fetchContent(false, 1);
    fetchCacheStatus();
  }, [fetchCategories, fetchContent, fetchCacheStatus]);

  // 定时刷新缓存状态
  useEffect(() => {
    const interval = setInterval(fetchCacheStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchCacheStatus]);

  // 监听页面导航事件
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('🔄 页面从缓存恢复，重新加载数据');
        fetchContent(false, 1);
        fetchCacheStatus();
      }
    };

    const handlePopState = () => {
      console.log('🔄 浏览器导航事件，重新加载数据');
      fetchContent(false, 1);
      fetchCacheStatus();
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [fetchContent, fetchCacheStatus]);

  // 监听页面可见性变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 页面重新可见，检查并刷新数据');
        fetchCacheStatus();
        if (items.length === 0 || !cacheStatus?.isValid) {
          fetchContent(false, 1);
        }
      }
    };

    const handleWindowFocus = () => {
      console.log('🔄 窗口获得焦点，检查数据状态');
      fetchCacheStatus();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [items.length, cacheStatus?.isValid, fetchContent, fetchCacheStatus]);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '0px 0px 200px 0px',
        threshold: 0,
      }
    );

    const sentinel = sentinelRef.current;

    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
      observer.disconnect();
    };
  }, [hasMore, loadMore]);

  return (
    <main
      className="min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 下拉刷新指示器 */}
      {isPulling && (
        <div
          className="fixed top-0 left-0 right-0 z-40 flex justify-center items-center transition-all duration-200"
          style={{
            transform: `translateY(${pullDistance - 60}px)`,
            opacity: pullDistance / 80,
          }}
        >
          <div className="glass-effect px-4 py-2 rounded-full flex items-center gap-2">
            <svg
              className={`w-5 h-5 transition-transform ${pullDistance > 60 ? 'rotate-180' : ''}`}
              style={{ color: 'var(--apple-blue)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--apple-blue)' }}>
              {pullDistance > 60 ? '松手刷新' : '下拉刷新'}
            </span>
          </div>
        </div>
      )}

      {/* Apple 风格导航栏 */}
      <nav className="apple-nav sticky top-0 z-50 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <h1 className="text-lg sm:text-xl font-semibold" style={{color: 'var(--text-primary)'}}>
              热门内容
            </h1>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/"
                className="text-sm font-medium transition-colors"
                style={{color: 'var(--apple-blue)'}}
              >
                首页
              </Link>
              <Link
                href="/history"
                className="text-sm font-medium transition-colors hover:text-[var(--apple-blue)]"
                style={{color: 'var(--text-secondary)'}}
              >
                历史
              </Link>
              <Link
                href="/favorites"
                className="text-sm font-medium transition-colors hover:text-[var(--apple-blue)]"
                style={{color: 'var(--text-secondary)'}}
              >
                收藏
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium transition-colors hover:text-[var(--apple-blue)]"
                style={{color: 'var(--text-secondary)'}}
              >
                个人中心
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <SearchBar onSearch={handleSearch} />
            <NotificationCenter />
            <UserHeader />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* 分类过滤器 - 仅移动端显示 */}
        <div className="md:hidden">
          <CategoryFilter
            categories={availableCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            isLoading={loading}
          />
        </div>

        {/* 内容区域 */}
        <div className="mt-6">
          {loading && items.length === 0 && categoryGroupedData.size === 0 ? (
            <LoadingSpinner message="正在加载内容..." />
          ) : error ? (
            <div className="text-center py-12">
              <div className="apple-card-large p-8 max-w-md mx-auto">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                  加载失败
                </h3>
                <p className="mb-6" style={{color: 'var(--text-secondary)'}}>
                  {error}
                </p>
                <button onClick={() => fetchContent(false)} className="apple-button">
                  重试
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 电脑端：分类卡片布局（仅在未选择分类时显示） */}
              {!selectedCategory && (
                <div className="hidden md:block">
                  {categoryGroupedData.size > 0 ? (
                    <div className="space-y-4">
                      {Array.from(categoryGroupedData.entries()).map(([category, categoryItems]) => {
                        const display = getCategoryDisplay(category);
                        return (
                          <div key={category} className="apple-card p-5">
                            {/* 分类标题 */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{display.icon}</span>
                                <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>
                                  {category}
                                </h3>
                                <span className="text-xs" style={{color: 'var(--text-tertiary)'}}>
                                  (更新时间: {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })})
                                </span>
                              </div>
                              <span className="px-3 py-1 rounded text-xs font-medium" style={{
                                backgroundColor: 'var(--apple-orange)',
                                color: 'white'
                              }}>
                                {display.name}
                              </span>
                            </div>

                            {/* 分类内容列表 */}
                            <div className="space-y-0">
                              {categoryItems.map((item, index) => (
                                <Link
                                  key={item.id}
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--gray-1)] transition-colors rounded-lg"
                                >
                                  {/* 序号 */}
                                  <span
                                    className="flex-shrink-0 w-6 text-center text-sm font-bold"
                                    style={{
                                      color: index < 3 ? 'var(--apple-orange)' : 'var(--text-tertiary)'
                                    }}
                                  >
                                    {index + 1}
                                  </span>

                                  {/* 标题 */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium truncate" style={{color: 'var(--text-primary)'}}>
                                      {item.title}
                                    </h4>
                                  </div>

                                  {/* 热度 */}
                                  <div className="flex items-center gap-1 text-xs" style={{color: 'var(--apple-orange)'}}>
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">
                                      {item.hotness ?
                                        item.hotness >= 10000 ?
                                          `${(item.hotness / 10000).toFixed(1)}万` :
                                          item.hotness.toLocaleString()
                                        : `${item.importance.toFixed(1)}`
                                      }
                                    </span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="apple-card-large p-12 text-center">
                      <div className="text-5xl mb-4">📭</div>
                      <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                        暂无内容
                      </h3>
                      <p style={{color: 'var(--text-secondary)'}}>
                        请稍后刷新重试
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 单分类列表视图（移动端或电脑端选择分类后） */}
              <div className={selectedCategory ? '' : 'md:hidden'}>
                {/* 电脑端：返回全部按钮 */}
                {selectedCategory && (
                  <div className="hidden md:block mb-4">
                    <button
                      onClick={() => handleCategoryChange(null)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--gray-2)]"
                      style={{
                        color: 'var(--apple-blue)',
                        backgroundColor: 'var(--gray-1)'
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      返回全部分类
                    </button>
                  </div>
                )}

                {/* 统计信息 */}
                {items.length > 0 && (
                  <div className="mb-3 sm:mb-4 flex justify-center">
                    <div className="glass-effect px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      {searchQuery ? (
                        <>
                          <span style={{color: 'var(--text-secondary)'}}>
                            找到
                          </span>
                          <span className="font-semibold" style={{color: 'var(--apple-blue)'}}>
                            {filteredItems.length}
                          </span>
                          <span style={{color: 'var(--text-secondary)'}}>
                            / {items.length} 条结果
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={{color: 'var(--text-secondary)'}}>
                            已显示
                          </span>
                          <span className="font-semibold" style={{color: 'var(--apple-blue)'}}>
                            {items.length}
                          </span>
                          {totalItems > 0 && (
                            <>
                              <span style={{color: 'var(--gray-4)'}}>/ {totalItems}</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 内容列表 */}
                {filteredItems.length === 0 && searchQuery ? (
                  <div className="apple-card-large p-12 text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                      未找到匹配结果
                    </h3>
                    <p className="mb-6" style={{color: 'var(--text-secondary)'}}>
                      试试其他关键词或清除搜索
                    </p>
                  </div>
                ) : (
                  <ContentList
                    items={filteredItems}
                    onDismiss={handleDismiss}
                  />
                )}

                {/* 自动加载触发器 */}
                {hasMore && (
                  <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
                )}

                {/* 加载更多按钮 */}
                {hasMore && items.length > 0 && (
                  <div className="mt-4 sm:mt-6 text-center px-3 sm:px-0">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="w-full sm:w-auto apple-button-secondary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base"
                    >
                      {loadingMore ? '加载中...' : '加载更多'}
                    </button>
                  </div>
                )}

                {!hasMore && items.length > 0 && (
                  <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm" style={{color: 'var(--text-tertiary)'}}>
                    已显示全部内容
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 页脚 */}
        <footer className="mt-12 pt-6 text-center text-xs" style={{color: 'var(--text-tertiary)'}}>
          <div className="apple-divider mb-4" />
          <p>Powered by Next.js • Deployed on Vercel</p>
        </footer>
      </div>
    </main>
  );
}
