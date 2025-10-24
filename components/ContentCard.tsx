import { ValueItem } from '@/types';

interface ContentCardProps {
  item: ValueItem;
}

export default function ContentCard({ item }: ContentCardProps) {
  const importanceColor = item.importance >= 8 ? 'text-cyber-secondary' : item.importance >= 6 ? 'text-cyber-primary' : 'text-cyber-accent';
  const glowColor = item.importance >= 8 ? 'glow-magenta' : item.importance >= 6 ? 'glow-cyan' : 'glow-purple';

  const formatHotness = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleClick = (e: React.MouseEvent) => {
    // 阻止默认的链接跳转行为
    e.preventDefault();

    // 显示确认对话框
    const confirmed = window.confirm(`即将访问外部链接:\n${item.title}\n\n确定要继续吗？`);

    if (confirmed) {
      // 在当前页面打开链接，这样用户可以使用浏览器的后退按钮返回
      window.location.href = item.link;
    }
  };

  return (
    <a
      href={item.link}
      onClick={handleClick}
      className="block group cursor-pointer"
      title="点击访问链接（将在当前页面打开）"
    >
      <div className={`relative bg-cyber-card/90 backdrop-blur-md border border-cyber-primary/40 p-4 transition-all duration-300 hover:border-cyber-primary/60 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] mb-4 ${glowColor}`}
        style={{
          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
          background: 'linear-gradient(135deg, rgba(10, 15, 30, 0.95), rgba(15, 20, 35, 0.98))',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* 重要性指示器 */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
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

        {/* 标题 */}
        <h3 className="text-lg font-bold text-cyber-primary group-hover:text-glow-cyan mb-2 pr-12" data-text={item.title}>
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

        {/* 悬停效果 */}
        <div className="absolute inset-0 border border-cyber-secondary/0 group-hover:border-cyber-secondary/20 transition-all duration-300 pointer-events-none"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
          }}
        ></div>

        {/* 悬停光晕效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/0 via-cyber-secondary/0 to-cyber-accent/0 group-hover:from-cyber-primary/5 group-hover:via-cyber-secondary/3 group-hover:to-cyber-accent/5 transition-all duration-500 pointer-events-none opacity-0 group-hover:opacity-100"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
          }}
        ></div>
      </div>
    </a>
  );
}
