'use client';

import { useState, useRef, useEffect } from 'react';
import { ValueItem } from '@/types';
import FavoriteButton from './FavoriteButton';

interface ContentCardProps {
  item: ValueItem;
  onDismiss?: (itemId: string) => void;
}

export default function ContentCard({ item, onDismiss }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // 保存清理函数的引用
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);
  
  // 根据重要性设置现代化配色方案
  const getColors = () => {
    if (item.importance >= 9) {
      // 玫瑰金 - 最高级
      return {
        text: 'text-rose-300',
        border: 'border-rose-400/60',
        hoverBorder: 'group-hover:border-rose-400',
        glow: '0 0 40px rgba(251, 207, 232, 0.5)',
        hoverGlow: '0 0 60px rgba(251, 207, 232, 0.7), inset 0 0 30px rgba(251, 207, 232, 0.2)',
        bgGradient: 'linear-gradient(135deg, rgba(251, 207, 232, 0.05), rgba(254, 205, 211, 0.08))',
        accent: 'bg-rose-500/20',
      };
    } else if (item.importance >= 8) {
      // 紫罗兰 - 高级
      return {
        text: 'text-violet-300',
        border: 'border-violet-400/60',
        hoverBorder: 'group-hover:border-violet-400',
        glow: '0 0 35px rgba(196, 181, 253, 0.5)',
        hoverGlow: '0 0 50px rgba(196, 181, 253, 0.7), inset 0 0 25px rgba(196, 181, 253, 0.2)',
        bgGradient: 'linear-gradient(135deg, rgba(196, 181, 253, 0.05), rgba(221, 214, 254, 0.08))',
        accent: 'bg-violet-500/20',
      };
    } else if (item.importance >= 7) {
      // 天蓝色 - 中高级
      return {
        text: 'text-sky-300',
        border: 'border-sky-400/60',
        hoverBorder: 'group-hover:border-sky-400',
        glow: '0 0 30px rgba(125, 211, 252, 0.5)',
        hoverGlow: '0 0 45px rgba(125, 211, 252, 0.7), inset 0 0 20px rgba(125, 211, 252, 0.2)',
        bgGradient: 'linear-gradient(135deg, rgba(125, 211, 252, 0.05), rgba(186, 230, 253, 0.08))',
        accent: 'bg-sky-500/20',
      };
    } else if (item.importance >= 6) {
      // 青绿色 - 中级
      return {
        text: 'text-teal-300',
        border: 'border-teal-400/60',
        hoverBorder: 'group-hover:border-teal-400',
        glow: '0 0 25px rgba(94, 234, 212, 0.5)',
        hoverGlow: '0 0 40px rgba(94, 234, 212, 0.7), inset 0 0 18px rgba(94, 234, 212, 0.2)',
        bgGradient: 'linear-gradient(135deg, rgba(94, 234, 212, 0.05), rgba(153, 246, 228, 0.08))',
        accent: 'bg-teal-500/20',
      };
    } else if (item.importance >= 5) {
      // 琥珀色 - 中低级
      return {
        text: 'text-amber-300',
        border: 'border-amber-400/60',
        hoverBorder: 'group-hover:border-amber-400',
        glow: '0 0 25px rgba(251, 191, 36, 0.4)',
        hoverGlow: '0 0 35px rgba(251, 191, 36, 0.6), inset 0 0 15px rgba(251, 191, 36, 0.15)',
        bgGradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.05), rgba(252, 211, 77, 0.08))',
        accent: 'bg-amber-500/20',
      };
    } else {
      // 石板灰 - 基础级
      return {
        text: 'text-slate-300',
        border: 'border-slate-400/60',
        hoverBorder: 'group-hover:border-slate-400',
        glow: '0 0 20px rgba(148, 163, 184, 0.4)',
        hoverGlow: '0 0 30px rgba(148, 163, 184, 0.6), inset 0 0 12px rgba(148, 163, 184, 0.15)',
        bgGradient: 'linear-gradient(135deg, rgba(148, 163, 184, 0.05), rgba(203, 213, 225, 0.08))',
        accent: 'bg-slate-500/20',
      };
    }
  };
  
  const colors = getColors();
  const importanceColor = colors.text;

  const formatHotness = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // 如果正在滑动，不触发点击
    if (Math.abs(swipeOffset) > 5) return;
    
    // 直接跳转到原文链接
    window.location.href = item.link;
  };

  // 触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  // 触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // 如果垂直滑动距离大于水平滑动，认为是滚动而不是左右滑动
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    // 只允许右滑（正方向）
    if (deltaX > 0) {
      e.preventDefault(); // 阻止默认的滚动行为
      setSwipeOffset(deltaX);
    }
  };

  // 触摸结束
  const handleTouchEnd = () => {
    const threshold = 120; // 滑动阈值

    if (swipeOffset > threshold) {
      // 触发删除
      setIsDismissing(true);
      setSwipeOffset(window.innerWidth); // 滑出屏幕

      // 延迟后调用删除回调
      setTimeout(() => {
        if (onDismiss) {
          onDismiss(item.id);
        }
      }, 300);
    } else {
      // 回弹
      setSwipeOffset(0);
    }

    touchStartX.current = 0;
    touchStartY.current = 0;
  };

  // 鼠标滑动支持（PC端）
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只响应左键
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - touchStartX.current;
      const deltaY = moveEvent.clientY - touchStartY.current;

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
      }

      if (deltaX > 0) {
        setSwipeOffset(deltaX);
      }
    };

    const handleMouseUp = () => {
      const threshold = 120;

      if (swipeOffset > threshold) {
        setIsDismissing(true);
        setSwipeOffset(window.innerWidth);

        setTimeout(() => {
          if (onDismiss) {
            onDismiss(item.id);
          }
        }, 300);
      } else {
        setSwipeOffset(0);
      }

      touchStartX.current = 0;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // 从清理函数列表中移除
      cleanupFunctionsRef.current = cleanupFunctionsRef.current.filter(fn => fn !== cleanup);
    };

    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // 添加到清理函数列表
    cleanupFunctionsRef.current.push(cleanup);
  };

  // 组件卸载时清理所有事件监听器
  useEffect(() => {
    return () => {
      // 执行所有待清理的函数
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative group cursor-pointer transition-all duration-300 ease-in-out mb-4 hover:z-10"
      style={{
        transform: `translateX(${swipeOffset}px) ${!isDismissing && swipeOffset === 0 ? 'scale(1.01)' : 'scale(1)'}`,
        opacity: isDismissing ? 0 : 1,
        transition: swipeOffset === 0 ? 'transform 0.3s ease-out, opacity 0.3s ease-out' : 'none',
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      title={swipeOffset > 50 ? "继续右滑删除" : "点击访问原文 / 右滑删除"}
    >
      {/* 滑动提示背景 */}
      {swipeOffset > 0 && (
        <div 
          className="absolute inset-0 flex items-center justify-start pl-8 pointer-events-none"
          style={{
            background: swipeOffset > 120 ? 'linear-gradient(90deg, rgba(255, 0, 100, 0.3), transparent)' : 'linear-gradient(90deg, rgba(0, 255, 255, 0.2), transparent)',
            opacity: Math.min(swipeOffset / 120, 1),
          }}
        >
          <div className="text-2xl">
            {swipeOffset > 120 ? '🗑️' : '→'}
          </div>
          <div className="ml-3 text-sm font-bold">
            {swipeOffset > 120 ? '松手删除' : '继续滑动'}
          </div>
        </div>
      )}
        <div
          className={`relative backdrop-blur-lg border-2 p-5 transition-all duration-300 overflow-hidden ${colors.border} ${colors.hoverBorder}`}
          style={{
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            background: `
              linear-gradient(135deg,
                rgba(3, 7, 18, 0.95),
                rgba(7, 14, 25, 0.98)
              ),
              ${colors.bgGradient}
            `,
            boxShadow: isHovered ? colors.hoverGlow : colors.glow,
            position: 'relative',
          }}
        >
        {/* 优雅的扫描线效果 */}
        <div
          className="absolute top-0 left-0 w-full h-0.5"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.text.replace('text-', 'rgb(').replace('300', ' 251 207 232)').replace('violet', ' 196 181 253)').replace('sky', ' 125 211 252)').replace('teal', ' 94 234 212)').replace('amber', ' 251 191 36)').replace('slate', ' 148 163 184')} 0.8, transparent)`,
            animation: isHovered ? 'scan-horizontal 1.5s linear infinite' : 'scan-horizontal 3s linear infinite',
            opacity: isHovered ? 0.8 : 0.4,
          }}
        />

        {/* 垂直扫描线 */}
        <div
          className="absolute top-0 w-0.5 h-full"
          style={{
            background: `linear-gradient(180deg, transparent, ${colors.text.replace('text-', 'rgb(').replace('300', ' 251 207 232)').replace('violet', ' 196 181 253').replace('sky', ' 125 211 252').replace('teal', ' 94 234 212').replace('amber', ' 251 191 36').replace('slate', ' 148 163 184')} 0.6, transparent)`,
            animation: isHovered ? 'scan-vertical 2s linear infinite' : 'scan-vertical 4s linear infinite',
            opacity: isHovered ? 0.6 : 0.3,
          }}
        />

        {/* 精致网格背景 */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(${colors.text.replace('text-', 'rgba(').replace('300', ' 251 207 232, 0.1)').replace('violet', ' 196 181, 253, 0.1)').replace('sky', ' 125 211, 252, 0.1)').replace('teal', ' 94 234, 212, 0.1)').replace('amber', ' 251 191, 36, 0.1)').replace('slate', ' 148 163, 184, 0.1)')} 1px, transparent 1px),
              linear-gradient(90deg, ${colors.text.replace('text-', 'rgba(').replace('300', ' 251 207 232, 0.1)').replace('violet', ' 196 181, 253, 0.1)').replace('sky', ' 125 211, 252, 0.1)').replace('teal', ' 94 234, 212, 0.1)').replace('amber', ' 251 191, 36, 0.1)').replace('slate', ' 148 163, 184, 0.1)')} 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
            animation: 'grid-move 12s linear infinite',
          }}
        />

        {/* 优雅闪烁效果 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 3px,
                ${colors.text.replace('text-', 'rgba(').replace('300', ' 251 207 232, 0.02)').replace('violet', ' 196 181, 253, 0.02)').replace('sky', ' 125 211, 252, 0.02)').replace('teal', ' 94 234, 212, 0.02)').replace('amber', ' 251 191, 36, 0.02)').replace('slate', ' 148 163, 184, 0.02)')} 3px,
                ${colors.text.replace('text-', 'rgba(').replace('300', ' 251 207 232, 0.02)').replace('violet', ' 196 181, 253, 0.02)').replace('sky', ' 125 211, 252, 0.02)').replace('teal', ' 94 234, 212, 0.02)').replace('amber', ' 251 191, 36, 0.02)').replace('slate', ' 148 163, 184, 0.02)')} 6px
              )
            `,
            animation: isHovered ? 'flicker-fast 0.8s ease-in-out infinite' : 'flicker-slow 3s ease-in-out infinite',
          }}
        />

        {/* 精美角落装饰 */}
        <div className="absolute top-0 left-0 w-6 h-6 opacity-60 group-hover:opacity-100 transition-all duration-300">
          <div className={`absolute top-0 left-0 w-full h-px ${colors.text.replace('text-', 'bg-').replace('300', 'bg-rose-400').replace('violet', 'bg-violet-400').replace('sky', 'bg-sky-400').replace('teal', 'bg-teal-400').replace('amber', 'bg-amber-400').replace('slate', 'bg-slate-400')}`} style={{ opacity: 0.7 }} />
          <div className={`absolute top-0 left-0 w-px h-full ${colors.text.replace('text-', 'bg-').replace('300', 'bg-rose-400').replace('violet', 'bg-violet-400').replace('sky', 'bg-sky-400').replace('teal', 'bg-teal-400').replace('amber', 'bg-amber-400').replace('slate', 'bg-slate-400')}`} style={{ opacity: 0.7 }} />
          <div className={`absolute top-1 left-1 w-4 h-4 border ${colors.text.replace('text-', 'border-').replace('300', 'border-rose-400/60').replace('violet', 'border-violet-400/60').replace('sky', 'border-sky-400/60').replace('teal', 'border-teal-400/60').replace('amber', 'border-amber-400/60').replace('slate', 'border-slate-400/60')}`} style={{ opacity: 0.3 }} />
        </div>
        <div className="absolute bottom-0 right-0 w-6 h-6 opacity-60 group-hover:opacity-100 transition-all duration-300">
          <div className={`absolute bottom-0 right-0 w-full h-px ${colors.text.replace('text-', 'bg-').replace('300', 'bg-rose-400').replace('violet', 'bg-violet-400').replace('sky', 'bg-sky-400').replace('teal', 'bg-teal-400').replace('amber', 'bg-amber-400').replace('slate', 'bg-slate-400')}`} style={{ opacity: 0.7 }} />
          <div className={`absolute bottom-0 right-0 w-px h-full ${colors.text.replace('text-', 'bg-').replace('300', 'bg-rose-400').replace('violet', 'bg-violet-400').replace('sky', 'bg-sky-400').replace('teal', 'bg-teal-400').replace('amber', 'bg-amber-400').replace('slate', 'bg-slate-400')}`} style={{ opacity: 0.7 }} />
          <div className={`absolute bottom-1 right-1 w-4 h-4 border ${colors.text.replace('text-', 'border-').replace('300', 'border-rose-400/60').replace('violet', 'border-violet-400/60').replace('sky', 'border-sky-400/60').replace('teal', 'border-teal-400/60').replace('amber', 'border-amber-400/60').replace('slate', 'border-slate-400/60')}`} style={{ opacity: 0.3 }} />
        </div>

        {/* 优雅数据流 */}
        <div className="absolute top-3 right-6 flex flex-col gap-1.5 opacity-50 group-hover:opacity-90 transition-all duration-300">
          <div className={`h-0.5 bg-gradient-to-r from-transparent to-current animate-pulse ${colors.text}`} style={{ width: '20px', animationDelay: '0s' }} />
          <div className={`h-0.5 bg-gradient-to-r from-transparent to-current animate-pulse ${colors.text}`} style={{ width: '16px', animationDelay: '0.3s' }} />
          <div className={`h-0.5 bg-gradient-to-r from-transparent to-current animate-pulse ${colors.text}`} style={{ width: '18px', animationDelay: '0.6s' }} />
        </div>

        {/* 梦幻内部光晕 */}
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            opacity: isHovered ? 1 : 0.2,
            background: isHovered
              ? `radial-gradient(circle at 40% 40%, ${colors.text.replace('text-', 'rgba(').replace('300', ' 251 207 232, 0.08)').replace('violet', ' 196 181, 253, 0.08)').replace('sky', ' 125 211, 252, 0.08)').replace('teal', ' 94 234, 212, 0.08)').replace('amber', ' 251 191, 36, 0.08)').replace('slate', ' 148 163, 184, 0.08)')}, transparent 65%)`
              : `radial-gradient(circle at 25% 25%, ${colors.text.replace('text-', 'rgba(').replace('300', ' 251 207 232, 0.04)').replace('violet', ' 196 181, 253, 0.04)').replace('sky', ' 125 211, 252, 0.04)').replace('teal', ' 94 234, 212, 0.04)').replace('amber', ' 251 191, 36, 0.04)').replace('slate', ' 148 163, 184, 0.04)')}, transparent 55%)`,
          }}
        />
        {/* 顶部操作区域 */}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          {/* 收藏按钮 */}
          <FavoriteButton item={item} />

          {/* 重要性指示器 */}
          <div className="flex items-center gap-1">
            {[...Array(Math.round(item.importance))].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 ${importanceColor} rounded-full`}
                style={{
                  boxShadow: `0 0 ${2 + i}px currentColor`,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* 标题 */}
        <h3 className={`relative text-lg font-bold mb-2 pr-12 ${colors.text} transition-all duration-300`}
          style={{
            textShadow: isHovered ? `0 0 10px ${colors.text.includes('cyan') ? 'rgba(0, 255, 255, 0.8)' : colors.text.includes('purple') ? 'rgba(200, 50, 255, 0.8)' : 'rgba(100, 150, 255, 0.8)'}` : 'none',
          }}
        >
          {item.title}
        </h3>

        {/* 描述 */}
        {item.description && (
          <p className="text-cyber-text/80 text-sm mb-3 line-clamp-3">
            {item.description}
          </p>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between text-xs text-cyber-text/60">
          <div className="flex items-center gap-3">
            {item.publishDate && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {item.publishDate}
              </span>
            )}
            {item.category && (
              <span className="px-2 py-0.5 bg-cyber-accent/30 text-cyber-accent rounded border border-cyber-accent/60 group-hover:glow-purple transition-all duration-300">
                {item.category}
              </span>
            )}
            {item.hotness && (
              <span className="flex items-center gap-1 text-orange-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {formatHotness(item.hotness)}
              </span>
            )}
          </div>

          <span className={`font-mono ${importanceColor}`}>
            {item.importance.toFixed(1)}
          </span>
        </div>

        {/* 点击访问提示 */}
        <div className={`absolute bottom-3 right-3 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none flex items-center gap-1 px-3 py-1 rounded-full backdrop-blur-sm ${colors.text}`}
          style={{
            background: colors.text.includes('cyan') ? 'rgba(0, 255, 255, 0.1)' : colors.text.includes('purple') ? 'rgba(200, 50, 255, 0.1)' : 'rgba(100, 150, 255, 0.1)',
            border: `1px solid ${colors.text.includes('cyan') ? 'rgba(0, 255, 255, 0.3)' : colors.text.includes('purple') ? 'rgba(200, 50, 255, 0.3)' : 'rgba(100, 150, 255, 0.3)'}`,
          }}
        >
          <span>点击访问</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scan-horizontal {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh));
            opacity: 0;
          }
        }

        @keyframes scan-vertical {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100vw));
            opacity: 0;
          }
        }

        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(20px, 20px);
          }
        }

        @keyframes flicker-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
        }

        @keyframes flicker-fast {
          0%, 100% {
            opacity: 1;
          }
          25% {
            opacity: 0.9;
          }
          50% {
            opacity: 1;
          }
          75% {
            opacity: 0.85;
          }
        }
      `}</style>
    </div>
  );
}
