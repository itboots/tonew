'use client';

import { useState, useEffect } from 'react';
import { ValueItem, ScrapeResponse } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ContentList from '@/components/ContentList';
import CyberButton from '@/components/CyberButton';

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
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const fetchContent = async (forceRefresh: boolean = false, page: number = 1) => {
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
  };

  const fetchCacheStatus = async () => {
    try {
      const response = await fetch('/api/cache-status');
      const data = await response.json();

      if (data.success && data.data) {
        setCacheStatus(data.data);
      }
    } catch (error) {
      console.error('获取缓存状态失败:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContent(true, 1);
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchContent(false, nextPage);
  };

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

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-4xl mx-auto relative">
        {/* 赛博边框装饰 */}
        <div className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(0,255,255,0.1) 0%, rgba(10, 15, 30, 0.95) 50%, rgba(255,0,255,0.1) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        ></div>
        {/* 头部 */}
        <header className="text-center mb-8 sm:mb-12 relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cyber-primary text-glow-cyan mb-2 sm:mb-4" data-text="YuCoder 赛博浏览器">
            YuCoder 赛博浏览器
          </h1>
          <p className="text-cyber-text/80 text-sm sm:text-base mb-4">
            实时聚合热门内容 · 智能分类筛选
          </p>

          {/* 缓存状态显示 */}
          {cacheStatus && (
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-cyber-bg-dark/50 border border-cyber-primary/20 rounded-full text-xs text-cyber-text/60">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${cacheStatus.isValid ? 'bg-green-400' : 'bg-yellow-400'} ${cacheStatus.isValid ? 'animate-pulse' : ''}`}></div>
                  <span>{cacheStatus.isValid ? '缓存有效' : '缓存过期'}</span>
                </div>
                {cacheStatus.lastUpdate && (
                  <>
                    <span className="text-cyber-text/40">•</span>
                    <span>更新: {new Date(cacheStatus.lastUpdate).toLocaleTimeString()}</span>
                  </>
                )}
                {cacheStatus.updateCount > 0 && (
                  <>
                    <span className="text-cyber-text/40">•</span>
                    <span>次数: {cacheStatus.updateCount}</span>
                  </>
                )}
              </div>
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
              {/* 统计信息 */}
              {items.length > 0 && (
                <div className="mb-6 text-center text-cyber-text/60 text-sm">
                  显示 <span className="text-cyber-primary font-bold">{items.length}</span>
                  {totalItems > 0 && ` / ${totalItems}`} 条热门内容
                  {totalItems > items.length && (
                    <span className="ml-2 text-cyber-secondary">
                      (第 {currentPage} 页)
                    </span>
                  )}
                </div>
              )}

              {/* 内容列表 */}
              <ContentList items={items} />

              {/* 加载更多按钮 */}
              {hasMore && items.length > 0 && (
                <div className="mt-8 text-center">
                  <CyberButton
                    onClick={loadMore}
                    loading={loading && currentPage > 1}
                    variant="outline"
                    className="px-8"
                  >
                    {loading && currentPage > 1 ? (
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
