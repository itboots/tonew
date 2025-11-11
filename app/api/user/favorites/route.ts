import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { client } from "@/lib/redis"
import { FavoriteItem } from "@/types"

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

    const favoritesKey = `user:${session.user.id}:favorites`
    const favoriteIds = await getRedisClient().smembers(favoritesKey)

    if (favoriteIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        metadata: { total: 0, hasMore: false }
      })
    }

    // Get favorite items data one by one since Upstash Redis doesn't support pipeline
    const favorites: FavoriteItem[] = []

    for (const id of favoriteIds) {
      const data = await getRedisClient().hgetall(`favorite:${id}`)
      if (data && Object.keys(data).length > 0) {
        favorites.push(data as unknown as FavoriteItem)
      }
    }

    // Sort by favorited date (newest first)
    favorites.sort((a, b) =>
      new Date(b.favoritedAt).getTime() - new Date(a.favoritedAt).getTime()
    )

    return NextResponse.json({
      success: true,
      data: favorites,
      metadata: { total: favorites.length, hasMore: false }
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
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { item, tags, notes }: { item: any, tags?: string[], notes?: string } = await request.json()

    if (!item || !item.id) {
      return NextResponse.json({ error: "Invalid item data" }, { status: 400 })
    }

    const favoriteId = `${session.user.id}:${item.id}`
    const favoriteKey = `favorite:${favoriteId}`
    const favoritesKey = `user:${session.user.id}:favorites`

    // Check if already favorited
    const exists = await getRedisClient().sismember(favoritesKey, favoriteId)
    if (exists) {
      return NextResponse.json({ error: "Item already favorited" }, { status: 409 })
    }

    // Create favorite item
    const favoriteItem: FavoriteItem = {
      ...item,
      userId: session.user.id,
      favoritedAt: new Date().toISOString(),
      tags: tags || [],
      notes: notes || "",
    }

    // Save to Redis
    await getRedisClient().hset(favoriteKey, favoriteItem as unknown as Record<string, unknown>)
    await getRedisClient().sadd(favoritesKey, favoriteId)

    // Set expiration (30 days)
    await getRedisClient().expire(favoriteKey, 60 * 60 * 24 * 30)
    await getRedisClient().expire(favoritesKey, 60 * 60 * 24 * 30)

    return NextResponse.json({
      success: true,
      data: favoriteItem,
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
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 })
    }

    const favoriteId = `${session.user.id}:${itemId}`
    const favoriteKey = `favorite:${favoriteId}`
    const favoritesKey = `user:${session.user.id}:favorites`

    // Remove from favorites
    await getRedisClient().srem(favoritesKey, favoriteId)
    await getRedisClient().del(favoriteKey)

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