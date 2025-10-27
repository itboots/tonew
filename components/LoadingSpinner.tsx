'use client';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = '正在加载...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-24 h-24">
        {/* 外圈 */}
        <div className="absolute inset-0 border-4 border-cyan-400/20 rounded-full"></div>
        
        {/* 旋转圈1 - 青色 */}
        <div 
          className="absolute inset-0 border-4 border-transparent border-t-cyan-400 border-r-cyan-400 rounded-full animate-spin"
          style={{
            animationDuration: '1s',
            filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.8))',
          }}
        ></div>
        
        {/* 旋转圈2 - 紫色 */}
        <div 
          className="absolute inset-2 border-4 border-transparent border-b-purple-400 border-l-purple-400 rounded-full animate-spin"
          style={{
            animationDuration: '1.5s',
            animationDirection: 'reverse',
            filter: 'drop-shadow(0 0 8px rgba(138, 43, 226, 0.8))',
          }}
        ></div>
        
        {/* 中心点 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"
            style={{
              boxShadow: '0 0 20px rgba(0, 255, 255, 1), 0 0 40px rgba(0, 255, 255, 0.5)',
            }}
          ></div>
        </div>
        
        {/* 外部光晕 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 blur-xl animate-pulse"></div>
      </div>
      
      <p className="mt-6 text-cyan-400 text-sm font-semibold tracking-wider animate-pulse"
        style={{
          textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
        }}
      >
        {message}
      </p>
      
      {/* 加载条 */}
      <div className="mt-4 w-48 h-1 bg-gray-700/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full"
          style={{
            animation: 'loading-bar 2s ease-in-out infinite',
          }}
        ></div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
