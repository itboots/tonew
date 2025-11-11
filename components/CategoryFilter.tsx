'use client';

import { useRef, useEffect, useState } from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  isLoading?: boolean;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  isLoading = false
}: CategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const [showAll, setShowAll] = useState(false);

  const handleCategoryClick = (category: string | null) => {
    if (isLoading) return;
    onCategoryChange(category);
  };

  // 自动滚动到选中的分类
  useEffect(() => {
    if (activeButtonRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = activeButtonRef.current;
      const containerWidth = container.offsetWidth;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;

      container.scrollTo({
        left: buttonLeft - containerWidth / 2 + buttonWidth / 2,
        behavior: 'smooth'
      });
    }
  }, [selectedCategory]);

  // 定义分类的显示名称和图标
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

  // 热门分类（前6个）
  const hotCategories = categories.slice(0, 6);
  const allCategories = categories;
  const displayCategories = showAll ? allCategories : hotCategories;

  return (
    <div className="mb-6">
      {/* 分类标题和操作 */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold" style={{color: 'var(--text-secondary)'}}>
            {selectedCategory ? getCategoryDisplay(selectedCategory).name : '热门分类'}
          </h2>
          {selectedCategory && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{
              backgroundColor: 'var(--apple-blue)',
              color: 'white'
            }}>
              已筛选
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedCategory && (
            <button
              onClick={() => handleCategoryClick(null)}
              className="text-xs font-medium"
              style={{color: 'var(--apple-blue)'}}
            >
              清除筛选
            </button>
          )}
          {!showAll && categories.length > 6 && (
            <button
              onClick={() => setShowAll(true)}
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{
                color: 'var(--apple-blue)',
                backgroundColor: 'var(--gray-1)'
              }}
            >
              查看全部 ({categories.length})
            </button>
          )}
          {showAll && (
            <button
              onClick={() => setShowAll(false)}
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{
                color: 'var(--apple-blue)',
                backgroundColor: 'var(--gray-1)'
              }}
            >
              收起
            </button>
          )}
        </div>
      </div>

      {/* iOS 风格横向/网格选择器 */}
      <div className={showAll ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 px-2' : ''}>
        {showAll ? (
          // 网格布局 - 显示全部时
          <>
            <button
              ref={selectedCategory === null ? activeButtonRef : null}
              onClick={() => handleCategoryClick(null)}
              disabled={isLoading}
              className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-[var(--apple-blue)] text-white shadow-md'
                  : 'bg-[var(--gray-1)] hover:bg-[var(--gray-2)]'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
              style={{
                color: selectedCategory === null ? 'white' : 'var(--text-primary)',
                minHeight: '72px'
              }}
            >
              <span className="text-2xl">🌐</span>
              <span className="text-xs">全部</span>
            </button>

            {allCategories.map((category) => {
              const display = getCategoryDisplay(category);
              const isActive = selectedCategory === category;

              return (
                <button
                  key={category}
                  ref={isActive ? activeButtonRef : null}
                  onClick={() => handleCategoryClick(category)}
                  disabled={isLoading}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--apple-blue)] text-white shadow-md'
                      : 'bg-[var(--gray-1)] hover:bg-[var(--gray-2)]'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                  style={{
                    color: isActive ? 'white' : 'var(--text-primary)',
                    minHeight: '72px'
                  }}
                >
                  <span className="text-2xl">{display.icon}</span>
                  <span className="text-xs whitespace-nowrap">{display.name}</span>
                </button>
              );
            })}
          </>
        ) : (
          // 横向滚动布局 - 默认
          <div
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto pb-2 px-2 scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* 全部按钮 */}
            <button
              ref={selectedCategory === null ? activeButtonRef : null}
              onClick={() => handleCategoryClick(null)}
              disabled={isLoading}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-[var(--apple-blue)] text-white shadow-md'
                  : 'bg-[var(--gray-1)] hover:bg-[var(--gray-2)]'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
              style={{
                color: selectedCategory === null ? 'white' : 'var(--text-primary)',
                minHeight: '36px'
              }}
            >
              <span className="text-base">🌐</span>
              <span>全部</span>
            </button>

            {/* 热门分类按钮 */}
            {hotCategories.map((category) => {
              const display = getCategoryDisplay(category);
              const isActive = selectedCategory === category;

              return (
                <button
                  key={category}
                  ref={isActive ? activeButtonRef : null}
                  onClick={() => handleCategoryClick(category)}
                  disabled={isLoading}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--apple-blue)] text-white shadow-md'
                      : 'bg-[var(--gray-1)] hover:bg-[var(--gray-2)]'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                  style={{
                    color: isActive ? 'white' : 'var(--text-primary)',
                    minHeight: '36px'
                  }}
                >
                  <span className="text-base">{display.icon}</span>
                  <span className="whitespace-nowrap">{display.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 隐藏滚动条的 CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}