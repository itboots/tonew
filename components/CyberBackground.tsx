'use client';

import { useEffect, useRef } from 'react';

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 粒子系统
    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      opacity: number;
      color: string;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 0.5 + 0.1;
        this.opacity = Math.random() * 0.5 + 0.3;
        const colors = ['#00ffff', '#ff00ff', '#7b2cbf'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.y += this.speedY;
        if (this.y > canvasHeight) {
          this.y = 0;
          this.x = Math.random() * canvasWidth;
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.color;
        context.globalAlpha = this.opacity;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
      }
    }

    // 创建粒子
    const particles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }

    // 动画循环
    let animationFrameId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 5, 16, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* 画布动画 */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* 扫描线效果 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
        <div
          className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70"
          style={{
            animation: 'scanline-move 4s linear infinite',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
          }}
        />
      </div>

      {/* 角落装饰 */}
      <div className="fixed top-0 left-0 w-32 h-32 pointer-events-none" style={{ zIndex: 3 }}>
        <div className="absolute top-4 left-4 w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent" />
        <div className="absolute top-4 left-4 w-0.5 h-16 bg-gradient-to-b from-cyan-400 to-transparent" />
        <div className="absolute top-3 left-3 w-2 h-2 border border-cyan-400 rounded-full animate-pulse" />
      </div>

      <div className="fixed top-0 right-0 w-32 h-32 pointer-events-none" style={{ zIndex: 3 }}>
        <div className="absolute top-4 right-4 w-16 h-0.5 bg-gradient-to-l from-magenta-400 to-transparent" />
        <div className="absolute top-4 right-4 w-0.5 h-16 bg-gradient-to-b from-magenta-400 to-transparent" />
        <div className="absolute top-3 right-3 w-2 h-2 border border-magenta-400 rounded-full animate-pulse" />
      </div>

      <div className="fixed bottom-0 left-0 w-32 h-32 pointer-events-none" style={{ zIndex: 3 }}>
        <div className="absolute bottom-4 left-4 w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent" />
        <div className="absolute bottom-4 left-4 w-0.5 h-16 bg-gradient-to-t from-cyan-400 to-transparent" />
        <div className="absolute bottom-3 left-3 w-2 h-2 border border-cyan-400 rounded-full animate-pulse" />
      </div>

      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none" style={{ zIndex: 3 }}>
        <div className="absolute bottom-4 right-4 w-16 h-0.5 bg-gradient-to-l from-magenta-400 to-transparent" />
        <div className="absolute bottom-4 right-4 w-0.5 h-16 bg-gradient-to-t from-magenta-400 to-transparent" />
        <div className="absolute bottom-3 right-3 w-2 h-2 border border-magenta-400 rounded-full animate-pulse" />
      </div>

      <style jsx>{`
        @keyframes scanline-move {
          0% {
            transform: translateY(-100vh);
          }
          100% {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </>
  );
}
