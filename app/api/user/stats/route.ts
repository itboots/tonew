import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 并行获取所有统计数据
    const [favoritesResult, historyResult, dismissedResult] = await Promise.all([
      // 收藏数量
      supabase
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      // 历史记录数量
      supabase
        .from('history')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      // 已滑掉的数量
      supabase
        .from('dismissed_items')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
    ]);

    // 获取用户加入日期（从 auth.users 表）
    const joinedDate = user.created_at || new Date().toISOString();

    const stats = {
      favoritesCount: favoritesResult.count || 0,
      historyCount: historyResult.count || 0,
      dismissedCount: dismissedResult.count || 0,
      joinedDate
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
