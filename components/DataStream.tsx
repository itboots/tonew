'use client';

import { useEffect, useState } from 'react';

export default function DataStream() {
  const [streams, setStreams] = useState<Array<{ id: number; left: string; delay: number }>>([]);

  useEffect(() => {
    // 创建多个数据流
    const newStreams = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
    }));
    setStreams(newStreams);
  }, []);

  const generateCode = () => {
    const chars = '01アイウエオカキクケコサシスセソABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {streams.map((stream) => (
        <div
          key={stream.id}
          className="absolute top-0 text-xs font-mono text-cyan-400/30 whitespace-nowrap"
          style={{
            left: stream.left,
            animationName: 'data-fall',
            animationDuration: `${10 + Math.random() * 10}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDelay: `${stream.delay}s`,
          }}
        >
          <div className="flex flex-col gap-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                style={{
                  opacity: i < 5 ? (5 - i) * 0.2 : 0,
                }}
              >
                {generateCode()}
              </div>
            ))}
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes data-fall {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </div>
  );
}
