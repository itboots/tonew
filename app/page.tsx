'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ValueItem, ScrapeResponse } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ContentList from '@/components/ContentList';
import UserHeader from '@/components/UserHeader';
import NotificationCenter from '@/components/NotificationCenter';
import CategoryFilter from '@/components/CategoryFilter';
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
    if (page === 1) {
      setLoading(true);
      setError(null);
    }

    try {
      const pageSize = 20;
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
        } else {
          setItems(prev => [...prev, ...(data.data || [])]);
        }

        setTotalItems(data.metadata?.total || data.data.length);
        setHasMore(data.data.length === pageSize);

        // 如果是强制刷新，更新缓存状态
      if (forceRefresh || data.metadata?.forceRefresh) {
        await fetchCacheStatus();
      }
    } else {
      setError(data.error || '获取内容失败');
      }
    } catch (err) {
      setError('网络请求失败，请检查连接');
    } finally {
      if (page === 1) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [fetchCacheStatus, selectedCategory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContent(true, 1);
  };

  // 处理分类过滤
  const handleCategoryChange = useCallback((category: string | null) => {
    console.log(`🔄 切换分类: ${category || '全部'}`);
    setSelectedCategory(category);
    setCurrentPage(1); // 重置页码
    setHasMore(true); // 重置加载更多状态
    // 立即获取新数据
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
    <main className="min-h-screen">
      {/* Apple 风格导航栏 */}
      <nav className="apple-nav sticky top-0 z-50 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold" style={{color: 'var(--text-primary)'}}>
              热门内容
            </h1>
            <div className="hidden sm:flex items-center space-x-4">
              <Link
                href="/"
                className="text-sm font-medium transition-colors"
                style={{color: 'var(--apple-blue)'}}
              >
                首页
              </Link>
              <Link
                href="/favorites"
                className="text-sm font-medium transition-colors"
                style={{color: 'var(--text-secondary)'}}
              >
                收藏
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationCenter />
            <UserHeader />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* 缓存状态显示 */}
        {cacheStatus && (
          <div className="mb-6 flex justify-center">
            <div className="glass-effect px-4 py-2 rounded-full flex items-center gap-3 text-sm">
              <div className={`apple-status-dot ${cacheStatus.isValid ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span style={{color: 'var(--text-secondary)'}}>
                {cacheStatus.isValid ? '缓存有效' : '缓存过期'}
              </span>
              {cacheStatus.lastUpdate && (
                <>
                  <span style={{color: 'var(--gray-4)'}}>•</span>
                  <span style={{color: 'var(--text-tertiary)'}}>
                    更新于 {new Date(cacheStatus.lastUpdate).toLocaleTimeString()}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* 操作按钮组 */}
        <div className="mb-6 flex justify-center gap-3">
          <button
            onClick={() => fetchContent(false)}
            disabled={loading && !refreshing}
            className="apple-button-secondary"
          >
            {loading && !refreshing ? '加载中...' : '普通刷新'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="apple-button"
          >
            {refreshing ? '刷新中...' : '⚡ 强制刷新'}
          </button>
        </div>

        {/* 分类过滤器 */}
        <CategoryFilter
          categories={availableCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          isLoading={loading}
        />

        {/* 内容区域 */}
        <div className="mt-6">
          {loading && items.length === 0 ? (
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
              {/* 统计信息 */}
              {items.length > 0 && (
                <div className="mb-4 flex justify-center">
                  <div className="glass-effect px-4 py-2 rounded-full flex items-center gap-3 text-sm">
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
                  </div>
                </div>
              )}

              {/* 内容列表 */}
              <ContentList
                items={items}
                onDismiss={handleDismiss}
              />

              {/* 自动加载触发器 */}
              {hasMore && (
                <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
              )}

              {/* 加载更多按钮 */}
              {hasMore && items.length > 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="apple-button-secondary px-8"
                  >
                    {loadingMore ? '加载中...' : '加载更多'}
                  </button>
                </div>
              )}

              {!hasMore && items.length > 0 && (
                <div className="mt-8 text-center text-sm" style={{color: 'var(--text-tertiary)'}}>
                  已显示全部内容
                </div>
              )}
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
