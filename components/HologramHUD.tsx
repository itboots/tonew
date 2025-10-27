'use client';

import { useEffect, useRef, useState } from 'react';

export default function HologramHUD() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 绘制六边形网格
    const drawHexagonGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, angle: number) => {
    const size = 40;
    const rows = Math.ceil(height / (size * 1.5)) + 2;
    const cols = Math.ceil(width / (size * Math.sqrt(3))) + 2;

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * size * Math.sqrt(3) + (row % 2) * size * Math.sqrt(3) / 2;
        const y = row * size * 1.5;

        // 添加呼吸效果
        const pulse = Math.sin(angle + (row + col) * 0.1) * 0.3 + 0.7;
        ctx.globalAlpha = 0.05 * pulse;

        drawHexagon(ctx, x, y, size);
      }
    }
    ctx.globalAlpha = 1;
  };

    const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.stroke();
    };
    
    const drawRadarScan = (ctx: CanvasRenderingContext2D, width: number, height: number, scanAngle: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;

    // 绘制扫描线
    const gradient = ctx.createLinearGradient(
      centerX,
      centerY,
      centerX + Math.cos(scanAngle) * radius,
      centerY + Math.sin(scanAngle) * radius
    );
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(scanAngle) * radius,
      centerY + Math.sin(scanAngle) * radius
    );
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.stroke();

    // 绘制扫描扇形
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, scanAngle - 0.3, scanAngle, false);
    ctx.closePath();
    const scanGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    scanGradient.addColorStop(0, 'rgba(0, 255, 255, 0.2)');
    scanGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = scanGradient;
    ctx.fill();
    };

    const drawHUDCircles = (ctx: CanvasRenderingContext2D, width: number, height: number, angle: number) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // 绘制多个旋转圆环
    [0.2, 0.25, 0.3].forEach((radiusFactor, index) => {
      const radius = Math.min(width, height) * radiusFactor;
      const segments = 60;
      const rotationSpeed = (index + 1) * 0.5;

      ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 - index * 0.08})`;
      ctx.lineWidth = 2;

      for (let i = 0; i < segments; i++) {
        if (i % 3 === 0) continue; // 创建间隙

        const startAngle = (i / segments) * Math.PI * 2 + angle * rotationSpeed;
        const endAngle = ((i + 1) / segments) * Math.PI * 2 + angle * rotationSpeed;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.stroke();
      }
    });
    };

    let angle = 0;
    let scanAngle = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawHexagonGrid(ctx, canvas.width, canvas.height, angle);
      drawRadarScan(ctx, canvas.width, canvas.height, scanAngle);
      drawHUDCircles(ctx, canvas.width, canvas.height, angle);

      angle += 0.005;
      scanAngle += 0.02;

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      {/* Canvas HUD效果 */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* 四角HUD装饰 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
        {/* 左上角 */}
        <div className="absolute top-8 left-8 w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M 0 30 L 0 0 L 30 0"
              stroke="rgba(0, 255, 255, 0.6)"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="5" cy="5" r="2" fill="rgba(0, 255, 255, 0.8)" className="animate-pulse" />
            <line x1="0" y1="15" x2="25" y2="15" stroke="rgba(0, 255, 255, 0.4)" strokeWidth="1" />
            <line x1="15" y1="0" x2="15" y2="25" stroke="rgba(0, 255, 255, 0.4)" strokeWidth="1" />
          </svg>
          {mounted && time && (
            <div className="absolute top-10 left-0 text-xs text-cyan-400 font-mono opacity-60">
              {time.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* 右上角 */}
        <div className="absolute top-8 right-8 w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M 70 0 L 100 0 L 100 30"
              stroke="rgba(0, 255, 255, 0.6)"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="95" cy="5" r="2" fill="rgba(0, 255, 255, 0.8)" className="animate-pulse" />
            <line x1="75" y1="15" x2="100" y2="15" stroke="rgba(0, 255, 255, 0.4)" strokeWidth="1" />
            <line x1="85" y1="0" x2="85" y2="25" stroke="rgba(0, 255, 255, 0.4)" strokeWidth="1" />
          </svg>
          <div className="absolute top-10 right-0 text-xs text-cyan-400 font-mono opacity-60 text-right">
            ONLINE
          </div>
        </div>

        {/* 左下角 */}
        <div className="absolute bottom-8 left-8 w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M 0 70 L 0 100 L 30 100"
              stroke="rgba(0, 255, 255, 0.6)"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="5" cy="95" r="2" fill="rgba(0, 255, 255, 0.8)" className="animate-pulse" />
            <line x1="0" y1="85" x2="25" y2="85" stroke="rgba(0, 255, 255, 0.4)" strokeWidth="1" />
            <line x1="15" y1="75" x2="15" y2="100" stroke="rgba(0, 255, 255, 0.4)" strokeWidth="1" />
          </svg>
          <div className="absolute bottom-10 left-0 text-xs text-cyan-400 font-mono opacity-60">
            SYS: OK
          </div>
        </div>

        {/* 右下角 */}
        <div className="absolute bottom-8 right-8 w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M 70 100 L 100 100 L 100 70"
              stroke="rgba(0, 255, 255, 0.6)"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="95" cy="95" r="2" fill="rgba(0, 255, 255, 0.8)" className="animate-pulse" />
            <line x1="75" y1="85" x2="100" y2="85" stroke="rgba(0, 255, 255, 0.4)" strokeWidth="1" />
            <line x1="85" y1="75" x2="85" y2="100" stroke="rgba(0, 255, 255, 0.4)" strokeWidth="1" />
          </svg>
          <div className="absolute bottom-10 right-0 text-xs text-cyan-400 font-mono opacity-60 text-right">
            v2.0.1
          </div>
        </div>
      </div>

      {/* 中心准星 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="relative w-64 h-64">
          <div className="absolute inset-0 border border-cyan-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-4 border border-cyan-400/30 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
          <div className="absolute inset-8 border border-cyan-400/40 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
        </div>
      </div>
    </>
  );
}
