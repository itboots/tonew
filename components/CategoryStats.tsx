import { ValueItem } from '@/types';

interface CategoryStatsProps {
  items: ValueItem[];
  onCategoryFilter?: (category: string | null) => void;
  activeCategory?: string | null;
}

interface StatItem {
  category: string;
  count: number;
  color: string;
  glowColor: string;
}

export default function CategoryStats({ items, onCategoryFilter, activeCategory }: CategoryStatsProps) {
  // 统计各分类数量
  const categoryStats = items.reduce((acc, item) => {
    const category = item.category || '未分类';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 添加"全部"选项
  const totalCount = items.length;

  // 转换为数组并排序
  const stats: StatItem[] = [
    { category: '全部', count: totalCount, color: 'text-cyber-primary', glowColor: 'glow-cyan' },
    ...Object.entries(categoryStats)
      .map(([category, count]) => ({
        category,
        count,
        color: getCategoryColor(category),
        glowColor: getCategoryGlowColor(category)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // 显示前5个分类
  ];

  function getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      '全部': 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400',
      // 技术编程类矩阵
      '代码矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-orange-500',
      '前端矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500',
      'Python矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-500',
      'AI神经矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500',
      '数据矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500',
      '算法矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-red-500',
      '云端矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-500',
      '后端矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-500',
      '芯片矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-pink-500',
      '通信矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500',
      '区块链矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500',
      // 娱乐视频类矩阵
      '虚拟矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-500',
      '游戏矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500',
      '动漫矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500',
      '娱乐矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500',
      '影视矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500',
      '知识矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500',
      // 音乐类矩阵
      '音频矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-lime-400 to-green-500',
      '摇滚矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600',
      '电音矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500',
      '古典矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
      '流行矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500',
      '说唱矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-500',
      // 资讯社区类矩阵
      '信息流': 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400',
      '科技矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500',
      '金融矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500',
      '教育矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500',
      '职业矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500',
      '健康矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500',
      '生活矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500',
      '社会矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500',
      // 购物类矩阵
      '好物矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500',
      '数码矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500',
      '载具矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-500',
      '时尚矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500',
      '家居矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
      '运动矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-lime-400 to-green-500',
      // 体育类矩阵
      '竞技矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-orange-500',
      '足球矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500',
      '篮球矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500',
      '球拍矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500',
      '田径矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-red-500',
      '赛车矩阵': 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500',
      // 默认分类
      '数据流': 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400',
      '综合资讯': 'text-cyber-text/60',
      '未分类': 'text-cyber-text/40'
    };
    return colors[category] || 'text-cyber-text/60';
  }

  function getCategoryGlowColor(category: string): string {
    const glows: { [key: string]: string } = {
      '全部': 'drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]',
      // 技术编程类矩阵
      '代码矩阵': 'drop-shadow-[0_0_12px_rgba(255,96,96,0.9)]',
      '前端矩阵': 'drop-shadow-[0_0_12px_rgba(0,188,255,0.9)]',
      'Python矩阵': 'drop-shadow-[0_0_12px_rgba(168,96,255,0.9)]',
      'AI神经矩阵': 'drop-shadow-[0_0_12px_rgba(0,255,255,0.9)]',
      '数据矩阵': 'drop-shadow-[0_0_12px_rgba(255,96,255,0.9)]',
      '算法矩阵': 'drop-shadow-[0_0_12px_rgba(255,96,128,0.9)]',
      '云端矩阵': 'drop-shadow-[0_0_12px_rgba(0,255,128,0.9)]',
      '后端矩阵': 'drop-shadow-[0_0_12px_rgba(168,96,255,0.9)]',
      '芯片矩阵': 'drop-shadow-[0_0_12px_rgba(255,160,96,0.9)]',
      '通信矩阵': 'drop-shadow-[0_0_12px_rgba(96,128,255,0.9)]',
      '区块链矩阵': 'drop-shadow-[0_0_12px_rgba(255,200,0,0.9)]',
      // 娱乐视频类矩阵
      '虚拟矩阵': 'drop-shadow-[0_0_12px_rgba(0,255,255,0.9)]',
      '游戏矩阵': 'drop-shadow-[0_0_12px_rgba(0,255,96,0.9)]',
      '动漫矩阵': 'drop-shadow-[0_0_12px_rgba(255,96,192,0.9)]',
      '娱乐矩阵': 'drop-shadow-[0_0_12px_rgba(255,96,255,0.9)]',
      '影视矩阵': 'drop-shadow-[0_0_12px_rgba(96,128,255,0.9)]',
      '知识矩阵': 'drop-shadow-[0_0_12px_rgba(0,255,200,0.9)]',
      // 音乐类矩阵
      '音频矩阵': 'drop-shadow-[0_0_12px_rgba(128,255,0,0.9)]',
      '摇滚矩阵': 'drop-shadow-[0_0_12px_rgba(255,64,64,0.9)]',
      '电音矩阵': 'drop-shadow-[0_0_12px_rgba(0,188,255,0.9)]',
      '古典矩阵': 'drop-shadow-[0_0_12px_rgba(255,200,0,0.9)]',
      '流行矩阵': 'drop-shadow-[0_0_12px_rgba(255,96,192,0.9)]',
      '说唱矩阵': 'drop-shadow-[0_0_12px_rgba(168,96,255,0.9)]',
      // 资讯社区类矩阵
      '信息流': 'drop-shadow-[0_0_12px_rgba(0,255,255,0.9)]',
      '科技矩阵': 'drop-shadow-[0_0_12px_rgba(96,128,255,0.9)]',
      '金融矩阵': 'drop-shadow-[0_0_12px_rgba(255,96,255,0.9)]',
      '教育矩阵': 'drop-shadow-[0_0_12px_rgba(96,128,255,0.9)]',
      '职业矩阵': 'drop-shadow-[0_0_12px_rgba(0,255,255,0.9)]',
      '健康矩阵': 'drop-shadow-[0_0_12px_rgba(0,255,96,0.9)]',
      '生活矩阵': 'drop-shadow-[0_0_12px_rgba(255,160,0,0.9)]',
      '社会矩阵': 'drop-shadow-[0_0_12px_rgba(128,96,255,0.9)]',
      // 购物类矩阵
      '好物矩阵': 'drop-shadow-[0_0_12px_rgba(255,200,0,0.9)]',
      '数码矩阵': 'drop-shadow-[0_0_12px_rgba(96,128,255,0.9)]',
      '载具矩阵': 'drop-shadow-[0_0_12px_rgba(255,96,64,0.9)]',
      '时尚矩阵': 'drop-shadow-[0_0_12px_rgba(255,96,192,0.9)]',
      '家居矩阵': 'drop-shadow-[0_0_12px_rgba(255,200,0,0.9)]',
      '运动矩阵': 'drop-shadow-[0_0_12px_rgba(128,255,0,0.9)]',
      // 体育类矩阵
      '竞技矩阵': 'drop-shadow-[0_0_12px_rgba(255,160,0,0.9)]',
      '足球矩阵': 'drop-shadow-[0_0_12px_rgba(0,255,96,0.9)]',
      '篮球矩阵': 'drop-shadow-[0_0_12px_rgba(255,160,0,0.9)]',
      '球拍矩阵': 'drop-shadow-[0_0_12px_rgba(96,128,255,0.9)]',
      '田径矩阵': 'drop-shadow-[0_0_12px_rgba(255,64,96,0.9)]',
      '赛车矩阵': 'drop-shadow-[0_0_12px_rgba(255,96,255,0.9)]',
      // 默认分类
      '数据流': 'drop-shadow-[0_0_12px_rgba(168,96,255,0.9)]',
      '综合资讯': '',
      '未分类': ''
    };
    return glows[category] || '';
  }

  function getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      '全部': '⚡',
      // 技术编程类矩阵
      '代码矩阵': '⚙️',
      '前端矩阵': '💻',
      'Python矩阵': '🐍',
      'AI神经矩阵': '🧠',
      '数据矩阵': '💾',
      '算法矩阵': '📊',
      '云端矩阵': '☁️',
      '后端矩阵': '⚙️',
      '芯片矩阵': '🔧',
      '通信矩阵': '📡',
      '区块链矩阵': '⛓️',
      // 娱乐视频类矩阵
      '虚拟矩阵': '🌐',
      '游戏矩阵': '🎮',
      '动漫矩阵': '🎌',
      '娱乐矩阵': '🎬',
      '影视矩阵': '🎥',
      '知识矩阵': '🧪',
      // 音乐类矩阵
      '音频矩阵': '🎵',
      '摇滚矩阵': '🎸',
      '电音矩阵': '🎹',
      '古典矩阵': '🎻',
      '流行矩阵': '🎤',
      '说唱矩阵': '🎧',
      // 资讯社区类矩阵
      '信息流': '📡',
      '科技矩阵': '🔬',
      '金融矩阵': '💰',
      '教育矩阵': '📚',
      '职业矩阵': '💼',
      '健康矩阵': '🏥',
      '生活矩阵': '🏠',
      '社会矩阵': '🌍',
      // 购物类矩阵
      '好物矩阵': '🛍️',
      '数码矩阵': '📱',
      '载具矩阵': '🚗',
      '时尚矩阵': '👗',
      '家居矩阵': '🏡',
      '运动矩阵': '⚽',
      // 体育类矩阵
      '竞技矩阵': '🏆',
      '足球矩阵': '⚽',
      '篮球矩阵': '🏀',
      '球拍矩阵': '🎾',
      '田径矩阵': '🏃',
      '赛车矩阵': '🏎️',
      // 默认分类
      '数据流': '🔄',
      '综合资讯': '📄',
      '未分类': '❓'
    };
    return icons[category] || '❓';
  }

  const handleCategoryClick = (category: string) => {
    if (onCategoryFilter) {
      if (category === '全部') {
        onCategoryFilter(null);
      } else {
        onCategoryFilter(category);
      }
    }
  };

  return (
    <div className="mb-6 p-4 bg-cyber-card/30 border border-cyber-primary/30 rounded-lg backdrop-blur-sm relative overflow-hidden">
      {/* 赛博网格背景 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/5 via-transparent to-cyber-secondary/5"></div>
      </div>

      {/* 标题 */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔮</span>
          <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
            CYBER MATRIX SYSTEM
          </h3>
        </div>
        {activeCategory && (
          <button
            onClick={() => handleCategoryClick('全部')}
            className="text-xs px-3 py-1 bg-gradient-to-r from-cyber-primary/20 to-cyber-primary/30 text-cyber-primary rounded hover:from-cyber-primary/30 hover:to-cyber-primary/40 transition-all duration-300 border border-cyber-primary/50 hover:border-cyber-primary/70 backdrop-blur-sm font-mono"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* 分类网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative">
        {stats.map((stat, index) => {
          const isActive = activeCategory === null && stat.category === '全部' ||
                         activeCategory === stat.category;

          return (
            <button
              key={stat.category}
              onClick={() => handleCategoryClick(stat.category)}
              className={`group relative p-4 bg-gradient-to-br from-cyber-bg-dark/80 via-cyber-bg-card/60 to-cyber-dark/80 backdrop-blur-md border transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] ${
                isActive
                  ? 'border-cyber-primary/80 shadow-[0_0_25px_rgba(0,255,255,0.7)] bg-gradient-to-br from-cyber-primary/20 to-cyber-secondary/10'
                  : 'border-cyber-primary/30 hover:border-cyber-primary/60 hover:bg-gradient-to-br hover:from-cyber-primary/10 hover:to-cyber-secondary/5'
              }`}
              style={{
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              }}
            >
              {/* 发光边框 */}
              {isActive && (
                <div className="absolute inset-0 border-2 border-cyber-primary/60 animate-pulse"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.6), inset 0 0 10px rgba(0, 255, 255, 0.2)',
                  }}
                ></div>
              )}

              {/* 内容 */}
              <div className="relative z-10">
                {/* 图标 */}
                <div className="text-lg mb-2 text-center">
                  {getCategoryIcon(stat.category)}
                </div>
                {/* 分类名称 */}
                <div className={`text-xs font-bold ${stat.color} ${stat.glowColor} mb-1 text-center leading-tight`}>
                  {stat.category}
                </div>
                {/* 计数 */}
                <div className="text-lg font-mono text-cyber-text font-bold text-center">
                  {stat.count}
                </div>
                {/* 状态指示器 */}
                {isActive && (
                  <div className="text-xs text-cyber-primary/90 mt-2 font-mono text-center animate-pulse">
                    ACTIVE
                  </div>
                )}
              </div>

              {/* 数字粒子效果 */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                }}
              >
                <div className="absolute top-0 left-0 w-full h-full">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-cyber-primary/60 rounded-full animate-ping"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '2s',
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* 悬停光效 */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/0 via-cyber-secondary/0 to-cyber-accent/0 group-hover:from-cyber-primary/10 group-hover:via-cyber-secondary/8 group-hover:to-cyber-accent/10 transition-all duration-500 pointer-events-none"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                  }}
              ></div>
            </button>
          );
        })}
      </div>

      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyber-primary/50 to-transparent"></div>
    </div>
  );
}