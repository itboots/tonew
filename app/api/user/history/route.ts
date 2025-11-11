import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 记录阅读历史
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, title, link, category, description } = await request.json();

    if (!itemId || !title || !link) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 插入历史记录（如果已存在相同 item_id，会更新 visited_at）
    const { error } = await supabase
      .from('history')
      .insert({
        user_id: user.id,
        item_id: itemId,
        title,
        link,
        category: category || null,
        description: description || null,
      });

    if (error) {
      console.error('记录历史失败:', error);
      return NextResponse.json(
        { error: '记录历史失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'History recorded'
    });
  } catch (error) {
    console.error('记录历史失败:', error);
    return NextResponse.json(
      { error: '记录历史失败' },
      { status: 500 }
    );
  }
}

// 获取阅读历史
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // 查询历史记录
    const { data: history, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', user.id)
      .order('visited_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('获取历史失败:', error);
      return NextResponse.json(
        { error: '获取历史失败' },
        { status: 500 }
      );
    }

    // 转换字段名以匹配前端期望
    const formattedHistory = history.map(item => ({
      id: item.id, // 使用数据库主键作为唯一标识
      itemId: item.item_id,
      title: item.title,
      link: item.link,
      category: item.category,
      description: item.description,
      visitedAt: item.visited_at,
    }));

    return NextResponse.json({
      success: true,
      data: formattedHistory
    });
  } catch (error) {
    console.error('获取历史失败:', error);
    return NextResponse.json(
      { error: '获取历史失败' },
      { status: 500 }
    );
  }
}

// 清除阅读历史
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const historyId = searchParams.get('id');
    const itemId = searchParams.get('itemId');

    if (historyId) {
      // 删除单条历史记录（通过数据库主键）
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('user_id', user.id)
        .eq('id', historyId);

      if (error) {
        console.error('删除历史失败:', error);
        return NextResponse.json(
          { error: '删除历史失败' },
          { status: 500 }
        );
      }
    } else if (itemId) {
      // 删除某个 item 的所有历史记录
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);

      if (error) {
        console.error('删除历史失败:', error);
        return NextResponse.json(
          { error: '删除历史失败' },
          { status: 500 }
        );
      }
    } else {
      // 清空所有历史
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('删除历史失败:', error);
        return NextResponse.json(
          { error: '删除历史失败' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: historyId || itemId ? 'Item removed' : 'History cleared'
    });
  } catch (error) {
    console.error('删除历史失败:', error);
    return NextResponse.json(
      { error: '删除历史失败' },
      { status: 500 }
    );
  }
}
