'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTheme } from '@/contexts/ThemeContext';

interface UserStats {
  favoritesCount: number;
  historyCount: number;
  dismissedCount: number;
  joinedDate: string;
}

interface UserPreferences {
  defaultCategory: string | null;
  theme: string;
  autoRefresh: boolean;
  notifications: boolean;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    loadUserData();
  }, [session, status, router]);

  const loadUserData = async () => {
    try {
      // 并行加载统计数据和偏好设置
      const [statsRes, prefsRes] = await Promise.all([
        fetch('/api/user/stats'),
        fetch('/api/user/preferences')
      ]);

      const statsData = await statsRes.json();
      const prefsData = await prefsRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (prefsData.success) {
        setPreferences(prefsData.preferences);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      const data = await response.json();

      if (data.success) {
        alert('设置已保存！');
      } else {
        alert('保存失败：' + data.error);
      }
    } catch (error) {
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('确定要退出登录吗？')) {
      await signOut({ callbackUrl: '/' });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="加载中..." />
      </div>
    );
  }

  if (!session) {
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
            个人中心
          </h1>
          <div className="w-20" /> {/* 占位符保持居中 */}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
        {/* 用户信息卡片 */}
        <div className="apple-card-large p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            {/* 头像 */}
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white"
              style={{ backgroundColor: 'var(--apple-blue)' }}
            >
              {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
            </div>

            {/* 用户名和邮箱 */}
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {session.user?.name || '用户'}
              </h2>
              <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                {session.user?.email}
              </p>
              {stats?.joinedDate && (
                <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  加入于 {new Date(stats.joinedDate).toLocaleDateString('zh-CN')}
                </p>
              )}
            </div>
          </div>

          {/* 统计数据 */}
          {stats && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 py-4 border-t border-b" style={{ borderColor: 'var(--gray-3)' }}>
              <Link href="/favorites" className="text-center group">
                <div className="text-2xl sm:text-3xl font-bold mb-1 transition-colors" style={{ color: 'var(--apple-blue)' }}>
                  {stats.favoritesCount}
                </div>
                <div className="text-xs sm:text-sm group-hover:underline" style={{ color: 'var(--text-secondary)' }}>
                  收藏
                </div>
              </Link>

              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--apple-green)' }}>
                  {stats.historyCount}
                </div>
                <div className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                  浏览历史
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--apple-orange)' }}>
                  {stats.dismissedCount}
                </div>
                <div className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                  已滑掉
                </div>
              </div>
            </div>
          )}

          {/* 退出登录按钮 */}
          <div className="mt-6">
            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: 'var(--apple-red)',
                color: 'white'
              }}
            >
              退出登录
            </button>
          </div>
        </div>

        {/* 偏好设置 */}
        {preferences && (
          <div className="apple-card-large p-6 sm:p-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              偏好设置
            </h3>

            <div className="space-y-4">
              {/* 主题设置 */}
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--gray-3)' }}>
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    主题
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    选择你喜欢的界面风格
                  </div>
                </div>
                <select
                  value={theme}
                  onChange={(e) => {
                    const newTheme = e.target.value as 'apple' | 'cyberpunk';
                    setTheme(newTheme);
                    setPreferences({ ...preferences!, theme: newTheme });
                  }}
                  className="apple-input px-3 py-2 text-sm"
                >
                  <option value="apple">Apple 风格</option>
                  <option value="cyberpunk">赛博朋克</option>
                </select>
              </div>

              {/* 自动刷新 */}
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--gray-3)' }}>
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    自动刷新
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    定期自动更新内容
                  </div>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, autoRefresh: !preferences.autoRefresh })}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    preferences.autoRefresh ? 'bg-[var(--apple-blue)]' : 'bg-[var(--gray-4)]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 通知 */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    通知
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    接收重要更新通知
                  </div>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    preferences.notifications ? 'bg-[var(--apple-blue)]' : 'bg-[var(--gray-4)]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 保存按钮 */}
            <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--gray-3)' }}>
              <button
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="apple-button w-full sm:w-auto px-8 py-3"
              >
                {isSaving ? '保存中...' : '保存设置'}
              </button>
            </div>
          </div>
        )}

        {/* 快捷操作 */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
          <Link
            href="/favorites"
            className="apple-card p-4 sm:p-6 text-center hover:shadow-lg transition-all"
          >
            <div className="text-3xl mb-2">⭐</div>
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
              我的收藏
            </div>
          </Link>

          <Link
            href="/"
            className="apple-card p-4 sm:p-6 text-center hover:shadow-lg transition-all"
          >
            <div className="text-3xl mb-2">🏠</div>
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
              返回首页
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
