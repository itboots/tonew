'use client';

import { useState, useRef, useEffect } from 'react';
import { ValueItem } from '@/types';
import FavoriteButton from './FavoriteButton';

interface ContentCardProps {
  item: ValueItem;
  onDismiss?: (itemId: string) => void;
}

export default function ContentCard({ item, onDismiss }: ContentCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);

  // 根据重要性设置 Apple 风格配色
  const getImportanceColor = () => {
    if (item.importance >= 9) return 'text-red-500'; // Apple Red
    if (item.importance >= 8) return 'text-orange-500'; // Apple Orange
    if (item.importance >= 7) return 'text-blue-500'; // Apple Blue
    if (item.importance >= 6) return 'text-green-500'; // Apple Green
    if (item.importance >= 5) return 'text-purple-500'; // Apple Purple
    return 'text-gray-500';
  };

  const formatHotness = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleCardClick = async (e: React.MouseEvent) => {
    if (Math.abs(swipeOffset) > 5) return;

    // 记录阅读历史
    try {
      await fetch('/api/user/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          title: item.title,
          link: item.link,
          category: item.category || '',
          description: item.description || ''
        })
      });
    } catch (error) {
      // 静默失败，不影响跳转
      console.error('记录历史失败:', error);
    }

    window.location.href = item.link;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // 只在主要是水平滑动时响应
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    if (deltaX > 0) {
      e.preventDefault();
      // 添加弹性效果：滑动越远，阻力越大
      const resistance = 0.8;
      setSwipeOffset(deltaX * resistance);
    }
  };

  const handleTouchEnd = () => {
    const threshold = 100; // 降低阈值，更容易触发
    if (swipeOffset > threshold) {
      setIsDismissing(true);
      setSwipeOffset(window.innerWidth);
      setTimeout(() => onDismiss?.(item.id), 250); // 缩短动画时间
    } else {
      setSwipeOffset(0);
    }
    touchStartX.current = 0;
    touchStartY.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - touchStartX.current;
      const deltaY = moveEvent.clientY - touchStartY.current;
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;
      if (deltaX > 0) setSwipeOffset(deltaX);
    };

    const handleMouseUp = () => {
      const threshold = 120;
      if (swipeOffset > threshold) {
        setIsDismissing(true);
        setSwipeOffset(window.innerWidth);
        setTimeout(() => onDismiss?.(item.id), 300);
      } else {
        setSwipeOffset(0);
      }
      touchStartX.current = 0;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      cleanupFunctionsRef.current = cleanupFunctionsRef.current.filter(fn => fn !== cleanup);
    };

    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    cleanupFunctionsRef.current.push(cleanup);
  };

  useEffect(() => {
    return () => {
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative mb-3"
      style={{
        transform: `translateX(${swipeOffset}px)`,
        opacity: isDismissing ? 0 : 1,
        transition: swipeOffset === 0 ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
      }}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      title={swipeOffset > 50 ? "继续右滑删除" : "点击访问原文 / 右滑删除"}
    >
      {/* 滑动提示背景 - Apple 风格 */}
      {swipeOffset > 0 && (
        <div
          className="absolute inset-0 flex items-center justify-start pl-4 sm:pl-6 rounded-2xl overflow-hidden"
          style={{
            background: swipeOffset > 100
              ? 'linear-gradient(90deg, rgba(255, 59, 48, 0.12), transparent)'
              : 'linear-gradient(90deg, rgba(0, 122, 255, 0.08), transparent)',
            opacity: Math.min(swipeOffset / 100, 1),
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                swipeOffset > 100 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{
                transform: `scale(${Math.min(swipeOffset / 100, 1.2)})`,
              }}
            >
              <span className="text-white text-lg sm:text-xl">
                {swipeOffset > 100 ? '🗑️' : '→'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className={`text-xs sm:text-sm font-semibold ${
                swipeOffset > 100 ? 'text-red-600' : 'text-blue-600'
              }`}>
                {swipeOffset > 100 ? '松手删除' : '继续滑动'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Apple 风格卡片 */}
      <div className="apple-card p-3 sm:p-4 cursor-pointer">
        {/* 顶部信息栏 */}
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
            {/* 重要性指示器 */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {[...Array(Math.min(Math.round(item.importance), 5))].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full ${getImportanceColor()}`}
                />
              ))}
            </div>

            {/* 分类标签 */}
            {item.category && (
              <span className="apple-badge apple-badge-blue text-[11px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1">
                {item.category}
              </span>
            )}
          </div>

          {/* 收藏按钮 */}
          <FavoriteButton item={item} />
        </div>

        {/* 标题 */}
        <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 leading-snug" style={{color: 'var(--text-primary)'}}>
          {item.title}
        </h3>

        {/* 描述 */}
        {item.description && (
          <p className="text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3" style={{color: 'var(--text-tertiary)'}}>
            {item.description}
          </p>
        )}

        {/* 底部信息栏 */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs" style={{color: 'var(--text-tertiary)'}}>
          <div className="flex items-center gap-2 sm:gap-3">
            {item.publishDate && (
              <span className="flex items-center gap-0.5 sm:gap-1">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">{item.publishDate}</span>
              </span>
            )}

            {item.hotness && (
              <span className="flex items-center gap-0.5 sm:gap-1" style={{color: 'var(--apple-orange)'}}>
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {formatHotness(item.hotness)}
              </span>
            )}
          </div>

          {/* 重要性分数 */}
          <span className={`font-medium text-xs sm:text-sm ${getImportanceColor()}`}>
            {item.importance.toFixed(1)}
          </span>
        </div>

        {/* 右箭头指示器 - 仅桌面端显示 */}
        <div className="hidden sm:block absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5" style={{color: 'var(--gray-5)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
