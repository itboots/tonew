'use client';

import { useState } from 'react';

interface CyberButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'accent' | 'outline';
  className?: string;
}

export default function CyberButton({ 
  onClick, 
  children, 
  loading = false, 
  variant = 'primary',
  className = ''
}: CyberButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = "group relative px-8 py-3 font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] min-h-[44px] overflow-hidden";
  
  const variantClasses = {
    primary: "bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border-2 border-cyan-400/60 text-cyan-400 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.6),inset_0_0_20px_rgba(0,255,255,0.1)]",
    accent: "bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border-2 border-purple-400/60 text-purple-400 hover:border-purple-400 hover:text-purple-300 hover:shadow-[0_0_30px_rgba(255,0,255,0.6),inset_0_0_20px_rgba(255,0,255,0.1)]",
    outline: "bg-transparent border-2 border-cyan-400/40 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-400/10 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]"
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
      }}
    >
      {/* 扫描线效果 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent)',
          animation: isHovered ? 'scan 1.5s linear infinite' : 'none',
        }}
      />
      
      {/* 内部光晕 */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* 角落装饰 */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* 按钮内容 */}
      <span className="relative z-10 flex items-center justify-center">
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="animate-pulse">处理中...</span>
          </>
        ) : (
          children
        )}
      </span>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </button>
  );
}
