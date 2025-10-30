import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { client } from "@/lib/redis"
import { UserPreferences } from "@/types"

// Helper function to ensure Redis client is available
function getRedisClient() {
  if (!client) {
    throw new Error("Redis client not available")
  }
  return client
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const preferencesKey = `user:${session.user.id}:preferences`
    const preferences = await getRedisClient().hgetall(preferencesKey)

    // Default preferences
    const defaultPreferences: UserPreferences = {
      categories: [],
      notifications: true,
      theme: "cyberpunk",
      autoRefresh: true,
    }

    return NextResponse.json({
      success: true,
      preferences: { ...defaultPreferences, ...preferences },
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
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()
    const preferencesKey = `user:${session.user.id}:preferences`

    // Get current preferences
    const current = await getRedisClient().hgetall(preferencesKey)

    // Merge with updates
    const updatedPreferences = { ...current, ...updates }

    // Save to Redis
    await getRedisClient().hset(preferencesKey, updatedPreferences)
    await getRedisClient().expire(preferencesKey, 60 * 60 * 24 * 30) // 30 days

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
    })
  } catch (error) {
    console.error("Update preferences error:", error)
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    )
  }
}