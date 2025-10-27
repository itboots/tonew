'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ValueItem, ScrapeResponse } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ContentList from '@/components/ContentList';
import CyberButton from '@/components/CyberButton';
import HologramHUD from '@/components/HologramHUD';
import DataStream from '@/components/DataStream';
import HologramPanel from '@/components/HologramPanel';

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
  }, [fetchCacheStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContent(true, 1);
  };

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
        
        // 尝试加载下一条数据
        if (hasMore) {
          try {
            const nextPageToLoad = Math.ceil((items.length + 1) / 20);
            await fetchContent(false, nextPageToLoad);
          } catch (error) {
            console.warn('⚠️ 加载下一条失败:', error);
          }
        }
      } else {
        console.error('❌ 记录失败:', data.error);
      }
    } catch (error) {
      console.error('❌ 调用API失败:', error);
    }
  }, [items.length, hasMore, fetchContent]);
  
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

  useEffect(() => {
    fetchContent(false, 1);
    fetchCacheStatus();

    // 每30秒检查一次缓存状态
    const interval = setInterval(fetchCacheStatus, 30000);

    // 监听页面导航事件（浏览器后退/前进/重新访问）
    const handlePageShow = (event: PageTransitionEvent) => {
      // 如果页面是从缓存中恢复的，重新加载数据
      if (event.persisted) {
        console.log('🔄 页面从缓存恢复，重新加载数据');
        fetchContent(false, 1);
        fetchCacheStatus();
      }
    };

    // 监听浏览器后退/前进事件
    const handlePopState = () => {
      console.log('🔄 浏览器导航事件，重新加载数据');
      fetchContent(false, 1);
      fetchCacheStatus();
    };

    // 监听页面可见性变化（从其他标签页切换回来时）
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 页面重新可见，检查并刷新数据');
        fetchCacheStatus();
        // 获取当前状态，如果数据过期或为空则重新加载
        if (items.length === 0 || !cacheStatus?.isValid) {
          fetchContent(false, 1);
        }
      }
    };

    // 监听窗口获得焦点事件
    const handleWindowFocus = () => {
      console.log('🔄 窗口获得焦点，检查数据状态');
      fetchCacheStatus();
    };

    // 添加事件监听器
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    // 清理函数
    return () => {
      clearInterval(interval);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <main className="min-h-screen p-3 sm:p-4 lg:p-6 relative">
      {/* JARVIS全息HUD效果 */}
      <HologramHUD />
      
      {/* 数据流效果 */}
      <DataStream />
      
      <div className="max-w-5xl mx-auto relative" style={{ zIndex: 10 }}>
        {/* 主容器霓虹边框 */}
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none animate-pulse"
          style={{
            background: 'linear-gradient(135deg, rgba(0,255,255,0.05) 0%, transparent 50%, rgba(255,0,255,0.05) 100%)',
            boxShadow: `
              0 0 40px rgba(0, 255, 255, 0.3),
              0 0 80px rgba(255, 0, 255, 0.2),
              inset 0 0 40px rgba(0, 255, 255, 0.1)
            `,
            border: '1px solid rgba(0, 255, 255, 0.3)',
          }}
        />
        {/* 头部 - 优化后更简洁的设计 */}
        <header className="text-center mb-6 sm:mb-8 relative z-10">
          {/* 顶部光晕效果 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-20 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" />

          {/* 简洁的状态指示器 */}
          <div className="relative inline-block px-4 py-2 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-lg" />
            <p className="relative text-cyan-300 text-xs sm:text-sm font-medium tracking-widest font-mono">
              <span className="text-cyan-400">[ACTIVE]</span>
              <span className="mx-2 text-cyan-400/40">•</span>
              <span className="text-cyan-400">MONITORING</span>
            </p>
          </div>

          {/* 缓存状态显示 - 全息面板 */}
          {cacheStatus && (
            <div className="mb-6 flex justify-center">
              <HologramPanel className="inline-block">
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${cacheStatus.isValid ? 'bg-cyan-400' : 'bg-yellow-400'} ${cacheStatus.isValid ? 'animate-pulse' : ''}`}
                      style={{ boxShadow: `0 0 10px ${cacheStatus.isValid ? 'rgba(0, 255, 255, 1)' : 'rgba(255, 255, 0, 1)'}` }}
                    />
                    <span className="text-cyan-400">{cacheStatus.isValid ? 'CACHE_VALID' : 'CACHE_EXPIRED'}</span>
                  </div>
                  {cacheStatus.lastUpdate && (
                    <>
                      <span className="text-cyan-400/40">|</span>
                      <span className="text-cyan-300/70">UPD: {new Date(cacheStatus.lastUpdate).toLocaleTimeString()}</span>
                    </>
                  )}
                  {cacheStatus.updateCount > 0 && (
                    <>
                      <span className="text-cyan-400/40">|</span>
                      <span className="text-cyan-300/70">CNT: {cacheStatus.updateCount}</span>
                    </>
                  )}
                </div>
              </HologramPanel>
            </div>
          )}

          {/* 刷新按钮组 */}
          <div className="flex justify-center gap-3">
            <CyberButton onClick={() => fetchContent(false)} loading={loading && !refreshing}>
              {loading && !refreshing ? '加载中...' : '普通刷新'}
            </CyberButton>
            <CyberButton
              onClick={handleRefresh}
              loading={refreshing}
              variant="accent"
              className="relative"
            >
              {refreshing ? (
                <>
                  <span className="inline-block animate-spin mr-2">⚡</span>
                  强制刷新中...
                </>
              ) : (
                <>
                  <span className="inline-block mr-2">⚡</span>
                  强制刷新
                </>
              )}
            </CyberButton>
          </div>

          {/* 操作提示 */}
          <div className="mt-4 text-center text-xs text-cyber-text/40">
            <p>普通刷新使用缓存 • 强制刷新重新获取数据</p>
            <p className="mt-1">系统每分钟自动更新缓存 • 每页显示20条</p>
          </div>
        </header>

        {/* 内容区域 */}
        <div className="relative z-10">
          {loading && items.length === 0 ? (
            <LoadingSpinner message="正在扫描目标网站..." />
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-block p-6 border-2 border-red-500/50 bg-red-500/10 rounded">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-red-400 mb-2">系统错误</h3>
                <p className="text-cyber-text/80 mb-4">{error}</p>
                <CyberButton onClick={() => fetchContent(false)}>
                  重试
                </CyberButton>
              </div>
            </div>
          ) : (
            <>
              {/* 统计信息 - HUD风格 */}
              {items.length > 0 && (
                <div className="mb-6 flex justify-center">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-cyan-500/5 border border-cyan-400/30 rounded font-mono text-sm backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 8px rgba(0, 255, 255, 1)' }} />
                      <span className="text-cyan-400">ITEMS:</span>
                      <span className="text-cyan-300 font-bold">{items.length}</span>
                      {totalItems > 0 && (
                        <span className="text-cyan-400/60">/ {totalItems}</span>
                      )}
                    </div>
                    {totalItems > items.length && (
                      <>
                        <span className="text-cyan-400/40">|</span>
                        <span className="text-cyan-300/70">PAGE: {currentPage}</span>
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
                <div className="mt-8 text-center">
                  <CyberButton
                    onClick={loadMore}
                    loading={loadingMore}
                    variant="outline"
                    className="px-8"
                  >
                    {loadingMore ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⚡</span>
                        加载中...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">📄</span>
                        加载更多
                      </>
                    )}
                  </CyberButton>
                </div>
              )}

              {!hasMore && items.length > 0 && (
                <div className="mt-8 text-center text-cyber-text/40 text-sm">
                  <p>🎯 已显示全部内容</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 页脚 */}
        <footer className="mt-12 pt-8 border-t border-cyber-primary/20 text-center text-cyber-text/40 text-xs relative z-10">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-cyber-primary rounded-full"></span>
            <p className="px-3 py-1 border border-cyber-primary/30 rounded">Powered by Next.js • Deployed on Vercel</p>
            <span className="inline-block w-2 h-2 bg-cyber-secondary rounded-full"></span>
          </div>
        </footer>
      </div>
    </main>
  );
}
