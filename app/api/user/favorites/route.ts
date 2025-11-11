import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 查询收藏列表
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('favorited_at', { ascending: false })

    if (error) {
      console.error("Get favorites error:", error)
      return NextResponse.json(
        { error: "Failed to get favorites" },
        { status: 500 }
      )
    }

    // 转换字段名以匹配前端期望
    const formattedFavorites = favorites.map(fav => ({
      id: fav.item_id,
      userId: fav.user_id,
      title: fav.title,
      link: fav.link,
      description: fav.description,
      category: fav.category,
      importance: fav.importance,
      tags: fav.tags || [],
      notes: fav.notes,
      publishDate: fav.publish_date,
      favoritedAt: fav.favorited_at,
    }))

    return NextResponse.json({
      success: true,
      data: formattedFavorites,
      metadata: { total: formattedFavorites.length, hasMore: false }
    })
  } catch (error) {
    console.error("Get favorites error:", error)
    return NextResponse.json(
      { error: "Failed to get favorites" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { item, tags, notes }: { item: any, tags?: string[], notes?: string } = await request.json()

    if (!item || !item.id) {
      return NextResponse.json({ error: "Invalid item data" }, { status: 400 })
    }

    // 检查是否已收藏
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_id', item.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Item already favorited" }, { status: 409 })
    }

    // 插入收藏记录
    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        item_id: item.id,
        title: item.title,
        link: item.link,
        description: item.description || null,
        category: item.category || null,
        importance: item.importance || null,
        tags: tags || [],
        notes: notes || null,
        publish_date: item.publishDate || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Add favorite error:", error)
      return NextResponse.json(
        { error: "Failed to add favorite" },
        { status: 500 }
      )
    }

    // 转换字段名
    const formattedFavorite = {
      id: favorite.item_id,
      userId: favorite.user_id,
      title: favorite.title,
      link: favorite.link,
      description: favorite.description,
      category: favorite.category,
      importance: favorite.importance,
      tags: favorite.tags || [],
      notes: favorite.notes,
      publishDate: favorite.publish_date,
      favoritedAt: favorite.favorited_at,
    }

    return NextResponse.json({
      success: true,
      data: formattedFavorite,
    })
  } catch (error) {
    console.error("Add favorite error:", error)
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 })
    }

    // 删除收藏记录
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('item_id', itemId)

    if (error) {
      console.error("Remove favorite error:", error)
      return NextResponse.json(
        { error: "Failed to remove favorite" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Favorite removed",
    })
  } catch (error) {
    console.error("Remove favorite error:", error)
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    )
  }
}
