import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { UserPreferences } from "@/types"

export async function GET() {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 查询用户配置
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('theme, auto_refresh')
      .eq('id', user.id)
      .single()

    // Default preferences
    const defaultPreferences: UserPreferences = {
      categories: [],
      notifications: true,
      theme: "apple",
      autoRefresh: true,
    }

    if (error || !profile) {
      // 如果没有配置，返回默认值
      return NextResponse.json({
        success: true,
        preferences: defaultPreferences,
      })
    }

    // 合并数据库配置和默认配置
    const preferences: UserPreferences = {
      ...defaultPreferences,
      theme: profile.theme || "apple",
      autoRefresh: profile.auto_refresh ?? true,
    }

    return NextResponse.json({
      success: true,
      preferences,
    })
  } catch (error) {
    console.error("Get preferences error:", error)
    return NextResponse.json(
      { error: "Failed to get preferences" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()

    // 更新用户配置（upsert 会自动处理插入或更新）
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        theme: updates.theme || 'apple',
        auto_refresh: updates.autoRefresh ?? true,
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (error) {
      console.error("Update preferences error:", error)
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      )
    }

    // 转换回前端期望的格式
    const preferences: UserPreferences = {
      categories: [],
      notifications: true,
      theme: profile.theme || 'apple',
      autoRefresh: profile.auto_refresh ?? true,
    }

    return NextResponse.json({
      success: true,
      preferences,
    })
  } catch (error) {
    console.error("Update preferences error:", error)
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    )
  }
}
