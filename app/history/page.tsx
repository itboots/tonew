'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface HistoryItem {
  id: string;
  itemId: string;
  title: string;
  link: string;
  category: string;
  description: string;
  visitedAt: string;
}

export default function HistoryPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      // 未登录则跳转登录并结束本页 loading，避免无限加载观感
      router.push('/auth/signin');
      setIsLoading(false);
      return;
    }

    loadHistory();
  }, [user, isUserLoading, router]);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/user/history');
      const data = await response.json();

      if (data.success) {
        setHistory(data.data || []);
      }
    } catch (error) {
      console.error('加载历史失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('确定要清空所有浏览历史吗？')) return;

    try {
      const response = await fetch('/api/user/history', {
        method: 'DELETE'
      });

      if (response.ok) {
        setHistory([]);
      }
    } catch (error) {
      console.error('清空历史失败:', error);
    }
  };

  const removeItem = async (historyId: string) => {
    try {
      const response = await fetch(`/api/user/history?id=${historyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== historyId));
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  // 未登录时优先返回，避免展示加载中
  if (!isUserLoading && !user) {
    return null;
  }

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="加载中..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* 导航栏 */}
      <nav className="apple-nav sticky top-0 z-50 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--apple-blue)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
          <h1 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            浏览历史
          </h1>
          <div className="w-20" />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
        {/* 操作栏 */}
        {history.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              共 {history.length} 条记录
            </div>
            <button
              onClick={clearHistory}
              className="text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{
                color: 'var(--apple-red)',
                backgroundColor: 'var(--gray-1)'
              }}
            >
              清空历史
            </button>
          </div>
        )}

        {/* 历史列表 */}
        {history.length === 0 ? (
          <div className="apple-card-large p-12 text-center">
            <div className="text-5xl mb-4">📖</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              暂无浏览历史
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              开始浏览内容，这里将记录你的阅读历史
            </p>
            <Link
              href="/"
              className="inline-block apple-button px-6 py-2.5"
            >
              开始浏览
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="apple-card p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-0"
                  >
                    {/* 分类标签 */}
                    {item.category && (
                      <div className="mb-2">
                        <span className="apple-badge apple-badge-blue text-xs">
                          {item.category}
                        </span>
                      </div>
                    )}

                    {/* 标题 */}
                    <h3
                      className="text-base font-semibold mb-1 hover:underline line-clamp-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.title}
                    </h3>

                    {/* 描述 */}
                    {item.description && (
                      <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-tertiary)' }}>
                        {item.description}
                      </p>
                    )}

                    {/* 访问时间 */}
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {new Date(item.visitedAt).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </a>

                  {/* 删除按钮 */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-2)]"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
