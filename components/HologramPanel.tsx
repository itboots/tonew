'use client';

import { ReactNode } from 'react';

interface HologramPanelProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export default function HologramPanel({ children, title, className = '' }: HologramPanelProps) {
  return (
    <div className={`relative ${className}`}>
      {/* 全息边框效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 backdrop-blur-sm border border-cyan-400/30 rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/10 to-transparent opacity-50" />
        
        {/* 扫描线 */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent"
          style={{
            height: '2px',
            animation: 'hologram-scan 3s ease-in-out infinite',
          }}
        />
        
        {/* 角落装饰 */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60" />
        
        {/* 脉冲点 */}
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 1)' }} />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 1)', animationDelay: '0.5s' }} />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 1)', animationDelay: '1s' }} />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 1)', animationDelay: '1.5s' }} />
      </div>

      {/* 内容区 */}
      <div className="relative p-6">
        {title && (
          <div className="mb-4 pb-2 border-b border-cyan-400/20">
            <h3 className="text-lg font-bold text-cyan-400 font-mono tracking-wider"
              style={{
                textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
              }}
            >
              {title}
            </h3>
          </div>
        )}
        {children}
      </div>

      <style jsx>{`
        @keyframes hologram-scan {
          0%, 100% {
            top: 0;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
