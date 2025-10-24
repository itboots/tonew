import { ValueItem } from '@/types';
import ContentCard from './ContentCard';

interface ContentListProps {
  items: ValueItem[];
}

export default function ContentList({ items }: ContentListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-cyber-primary mb-2">未找到内容</h3>
        <p className="text-cyber-text/60 text-center">
          暂时没有发现有价值的内容，请稍后刷新重试
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  );
}
