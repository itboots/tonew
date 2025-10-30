import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { client } from "@/lib/redis"
import { Tag } from "@/types"

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

    const tagsKey = `user:${session.user.id}:tags`
    const tagIds = await getRedisClient().smembers(tagsKey)

    if (tagIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Get tag data one by one since Upstash Redis doesn't support pipeline
    const tags: Tag[] = []

    for (const id of tagIds) {
      const data = await getRedisClient().hgetall(`tag:${id}`)
      if (data && Object.keys(data).length > 0) {
        tags.push(data as unknown as Tag)
      }
    }

    // Sort by name
    tags.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({
      success: true,
      data: tags,
    })
  } catch (error) {
    console.error("Get tags error:", error)
    return NextResponse.json(
      { error: "Failed to get tags" },
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

    const { name, color } = await request.json()

    if (!name || !color) {
      return NextResponse.json(
        { error: "Name and color are required" },
        { status: 400 }
      )
    }

    // Check if tag already exists
    const tagsKey = `user:${session.user.id}:tags`
    const existingTags = await getRedisClient().smembers(tagsKey)

    for (const tagId of existingTags) {
      const tagData = await getRedisClient().hgetall(`tag:${tagId}`)
      if (tagData.name === name) {
        return NextResponse.json(
          { error: "Tag with this name already exists" },
          { status: 409 }
        )
      }
    }

    const tagId = `${session.user.id}:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const tagKey = `tag:${tagId}`

    const tag: Tag = {
      id: tagId,
      name: name.trim(),
      color,
      userId: session.user.id,
      createdAt: new Date().toISOString(),
      itemCount: 0,
    }

    // Save tag
    await getRedisClient().hset(tagKey, tag)
    await getRedisClient().sadd(tagsKey, tagId)

    // Set expiration (30 days)
    await getRedisClient().expire(tagKey, 60 * 60 * 24 * 30)
    await getRedisClient().expire(tagsKey, 60 * 60 * 24 * 30)

    return NextResponse.json({
      success: true,
      data: tag,
    })
  } catch (error) {
    console.error("Create tag error:", error)
    return NextResponse.json(
      { error: "Failed to create tag" },
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

    const { tagId, name, color } = await request.json()

    if (!tagId || (!name && !color)) {
      return NextResponse.json(
        { error: "Tag ID and at least one field to update are required" },
        { status: 400 }
      )
    }

    const tagKey = `tag:${tagId}`

    // Verify tag belongs to user
    const existingTag = await getRedisClient().hgetall(tagKey)
    if (!existingTag || existingTag.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Tag not found or access denied" },
        { status: 404 }
      )
    }

    // Check for duplicate name if updating name
    if (name && name !== existingTag.name) {
      const tagsKey = `user:${session.user.id}:tags`
      const existingTags = await getRedisClient().smembers(tagsKey)

      for (const existingTagId of existingTags) {
        if (existingTagId !== tagId) {
          const tagData = await getRedisClient().hgetall(`tag:${existingTagId}`)
          if (tagData.name === name) {
            return NextResponse.json(
              { error: "Tag with this name already exists" },
              { status: 409 }
            )
          }
        }
      }
    }

    // Update tag
    const updates: Partial<Tag> = {}
    if (name) updates.name = name.trim()
    if (color) updates.color = color

    await getRedisClient().hset(tagKey, updates)

    // Get updated tag
    const updatedTag = await getRedisClient().hgetall(tagKey)

    return NextResponse.json({
      success: true,
      data: updatedTag,
    })
  } catch (error) {
    console.error("Update tag error:", error)
    return NextResponse.json(
      { error: "Failed to update tag" },
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
    const tagId = searchParams.get("id")

    if (!tagId) {
      return NextResponse.json(
        { error: "Tag ID is required" },
        { status: 400 }
      )
    }

    const tagKey = `tag:${tagId}`
    const tagsKey = `user:${session.user.id}:tags`

    // Verify tag belongs to user
    const existingTag = await getRedisClient().hgetall(tagKey)
    if (!existingTag || existingTag.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Tag not found or access denied" },
        { status: 404 }
      )
    }

    // Remove tag
    await getRedisClient().del(tagKey)
    await getRedisClient().srem(tagsKey, tagId)

    // Remove tag from all items that have it
    // This would require iterating through all favorites - for now we'll leave it
    // In a production system, you might want to maintain an index of tag->items

    return NextResponse.json({
      success: true,
      message: "Tag deleted",
    })
  } catch (error) {
    console.error("Delete tag error:", error)
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    )
  }
}