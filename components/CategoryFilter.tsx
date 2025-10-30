'use client';

import { useState } from 'react';
import HologramPanel from './HologramPanel';

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
  const handleCategoryClick = (category: string | null) => {
    if (isLoading) return;
    onCategoryChange(category);
  };

  // 定义分类的显示名称和图标
  const getCategoryDisplay = (category: string) => {
    const categoryMap: { [key: string]: { name: string; icon: string; color: string } } = {
      '知乎热榜': { name: '知乎', icon: '📚', color: 'blue' },
      '微博热搜': { name: '微博', icon: '🔥', color: 'red' },
      '抖音热搜': { name: '抖音', icon: '🎵', color: 'black' },
      'B站热门': { name: 'B站', icon: '📺', color: 'pink' },
      '虎扑步行街热榜': { name: '虎扑', icon: '⚽', color: 'green' },
      '百度贴吧热榜': { name: '贴吧', icon: '💬', color: 'cyan' },
      '编程热门': { name: '编程', icon: '💻', color: 'purple' },
      'CSDN热榜': { name: 'CSDN', icon: '👨‍💻', color: 'orange' },
      '掘金热榜': { name: '掘金', icon: '⛏️', color: 'yellow' },
      '网易云热歌榜': { name: '网易云', icon: '🎶', color: 'red' },
      'QQ音乐热歌榜': { name: 'QQ', icon: '🎵', color: 'green' },
      '什么值得买热榜': { name: '值得买', icon: '🛒', color: 'orange' },
      '直播吧体育热榜': { name: '体育', icon: '🏀', color: 'blue' },
    };

    return categoryMap[category] || { name: category, icon: '📰', color: 'gray' };
  };

  return (
    <div className="mb-6">
      {/* 分类过滤标题 */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-cyan-500/10 blur-lg" />
          <h2 className="relative text-cyan-300 text-sm font-bold tracking-widest font-mono px-4 py-2">
            <span className="text-cyan-400">[FILTER]</span>
            <span className="mx-2 text-cyan-400/40">•</span>
            <span className="text-cyan-400">CATEGORY SELECT</span>
          </h2>
        </div>
      </div>

      {/* 分类按钮容器 */}
      <HologramPanel className="p-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* 全部按钮 */}
          <button
            onClick={() => handleCategoryClick(null)}
            disabled={isLoading}
            className={`relative px-4 py-2 rounded-lg font-mono text-xs font-medium transition-all duration-300 ${
              selectedCategory === null
                ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400 shadow-lg shadow-cyan-400/25'
                : 'bg-gray-500/10 text-gray-300 border-2 border-gray-600 hover:bg-gray-500/20 hover:text-gray-200 hover:border-gray-500'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
              boxShadow: selectedCategory === null
                ? '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)'
                : 'none'
            }}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm">🌐</span>
              <span>全部</span>
              <span className="text-cyan-400/60 text-[10px]">ALL</span>
            </span>
            {selectedCategory === null && (
              <div className="absolute inset-0 rounded-lg animate-pulse"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(0, 255, 255, 0.1) 50%, transparent 70%)',
                  animation: 'slide 2s ease-in-out infinite'
                }}
              />
            )}
          </button>

          {/* 分类按钮 */}
          {categories.map((category) => {
            const display = getCategoryDisplay(category);
            const isActive = selectedCategory === category;

            return (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                disabled={isLoading}
                className={`relative px-3 py-2 rounded-lg font-mono text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400 shadow-lg shadow-cyan-400/25'
                    : 'bg-gray-500/10 text-gray-300 border-2 border-gray-600 hover:bg-gray-500/20 hover:text-gray-200 hover:border-gray-500'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  boxShadow: isActive
                    ? '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)'
                    : 'none'
                }}
              >
                <span className="flex items-center gap-1">
                  <span className="text-sm">{display.icon}</span>
                  <span>{display.name}</span>
                  <span className="text-cyan-400/60 text-[10px] ml-1">
                    {category.split('')[0]}
                  </span>
                </span>
                {isActive && (
                  <div className="absolute inset-0 rounded-lg animate-pulse"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(0, 255, 255, 0.1) 50%, transparent 70%)',
                      animation: 'slide 2s ease-in-out infinite'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* 选中状态指示器 */}
        {selectedCategory && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-400/30 rounded-full text-xs font-mono">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                style={{ boxShadow: '0 0 8px rgba(0, 255, 255, 1)' }} />
              <span className="text-cyan-400">FILTERED:</span>
              <span className="text-cyan-300">{getCategoryDisplay(selectedCategory).name}</span>
            </div>
          </div>
        )}
      </HologramPanel>

      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}