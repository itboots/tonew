import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { client } from "@/lib/redis"

// Helper function to ensure Redis client is available
function getRedisClient() {
  if (!client) {
    throw new Error("Redis client not available")
  }
  return client
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { itemId, tagIds } = await request.json()

    if (!itemId || !Array.isArray(tagIds)) {
      return NextResponse.json(
        { error: "Item ID and tag IDs array are required" },
        { status: 400 }
      )
    }

    const favoriteId = `${user.id}:${itemId}`
    const favoriteKey = `favorite:${favoriteId}`

    // Verify favorite exists and belongs to user
    const favorite = await getRedisClient().hgetall(favoriteKey)
    if (!favorite || favorite.userId !== user.id) {
      return NextResponse.json(
        { error: "Favorite item not found or access denied" },
        { status: 404 }
      )
    }

    // Verify all tags belong to user
    const tagsKey = `user:${user.id}:tags`
    const userTagIds = await getRedisClient().smembers(tagsKey)

    for (const tagId of tagIds) {
      if (!userTagIds.includes(tagId)) {
        return NextResponse.json(
          { error: "Tag not found or access denied" },
          { status: 404 }
        )
      }
    }

    // Update favorite with tags
    await getRedisClient().hset(favoriteKey, { tags: JSON.stringify(tagIds) })

    // Update tag item counts
    for (const tagId of tagIds) {
      const tagKey = `tag:${tagId}`
      await getRedisClient().hincrby(tagKey, "itemCount", 1)
    }

    return NextResponse.json({
      success: true,
      message: "Tags added to item",
    })
  } catch (error) {
    console.error("Add tags to item error:", error)
    return NextResponse.json(
      { error: "Failed to add tags to item" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")
    const tagId = searchParams.get("tagId")

    if (!itemId || !tagId) {
      return NextResponse.json(
        { error: "Item ID and Tag ID are required" },
        { status: 400 }
      )
    }

    const favoriteId = `${user.id}:${itemId}`
    const favoriteKey = `favorite:${favoriteId}`

    // Verify favorite exists and belongs to user
    const favorite = await getRedisClient().hgetall(favoriteKey)
    if (!favorite || favorite.userId !== user.id) {
      return NextResponse.json(
        { error: "Favorite item not found or access denied" },
        { status: 404 }
      )
    }

    // Get current tags
    const currentTags = favorite.tags ? JSON.parse(favorite.tags as string) : []

    if (!currentTags.includes(tagId)) {
      return NextResponse.json(
        { error: "Tag not found on item" },
        { status: 404 }
      )
    }

    // Remove tag from item
    const updatedTags = currentTags.filter((id: string) => id !== tagId)
    await getRedisClient().hset(favoriteKey, { tags: JSON.stringify(updatedTags) })

    // Update tag item count
    const tagKey = `tag:${tagId}`
    await getRedisClient().hincrby(tagKey, "itemCount", -1)

    return NextResponse.json({
      success: true,
      message: "Tag removed from item",
    })
  } catch (error) {
    console.error("Remove tag from item error:", error)
    return NextResponse.json(
      { error: "Failed to remove tag from item" },
      { status: 500 }
    )
  }
}