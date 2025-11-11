'use client';

import { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = '搜索内容...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 延迟搜索，避免频繁触发
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleCollapse = () => {
    if (!query) {
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsExpanded(false);
  };

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 transition-all duration-300 ${
          isExpanded ? 'w-64 sm:w-80' : 'w-10'
        }`}
      >
        {/* 搜索图标/按钮 */}
        {!isExpanded ? (
          <button
            onClick={handleExpand}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-2)]"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="搜索"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        ) : (
          <div className="flex-1 relative">
            {/* 搜索输入框 */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: 'var(--text-tertiary)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={handleCollapse}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2 rounded-full text-sm transition-all"
                style={{
                  backgroundColor: 'var(--gray-1)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  outline: 'none'
                }}
              />

              {/* 清除按钮 */}
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: 'var(--gray-4)',
                    color: 'white'
                  }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 搜索结果提示 */}
      {query && (
        <div className="absolute top-12 left-0 right-0 z-10">
          <div
            className="px-3 py-2 rounded-lg text-xs"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-secondary)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            搜索: &quot;{query}&quot;
          </div>
        </div>
      )}
    </div>
  );
}
