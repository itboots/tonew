import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/simple-auth"
import { client } from "@/lib/redis"
import { Notification } from "@/types"

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

    // Use a different approach since Upstash Redis doesn't support zrevrange
    // We'll store notifications in a simple list and sort them by timestamp
    const notificationsPattern = `notification:${session.user.id}:*`
    const notificationIds = await getRedisClient().keys(notificationsPattern)

    // Get all notification data and sort by timestamp
    const notifications: Notification[] = []
    for (const id of notificationIds) {
      const data = await getRedisClient().hgetall(id)
      if (data && Object.keys(data).length > 0) {
        notifications.push(data as unknown as Notification)
      }
    }

    // Sort by creation date (newest first) and take latest 50
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const latestNotifications = notifications.slice(0, 50)

    const unreadCount = latestNotifications.filter(n => !n.read).length

    return NextResponse.json({
      success: true,
      data: latestNotifications,
      metadata: { total: latestNotifications.length, unreadCount }
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json(
      { error: "Failed to get notifications" },
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

    const { type, title, message, data } = await request.json()

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Type, title, and message are required" },
        { status: 400 }
      )
    }

    const notificationId = `${session.user.id}:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const notificationKey = `notification:${notificationId}`
    const notificationsKey = `user:${session.user.id}:notifications`

    const notification: Notification = {
      id: notificationId,
      userId: session.user.id,
      type: type as 'new_content' | 'favorite_tag' | 'system',
      title,
      message,
      data: data || null,
      read: false,
      createdAt: new Date().toISOString(),
    }

    // Save notification
    await getRedisClient().hset(notificationKey, notification as Record<string, unknown>)

    // Set expiration (30 days)
    await getRedisClient().expire(notificationKey, 60 * 60 * 24 * 30)

    // Publish to Redis pub/sub for real-time delivery
    await getRedisClient().publish(`user:${session.user.id}:notifications`, JSON.stringify(notification))

    return NextResponse.json({
      success: true,
      data: notification,
    })
  } catch (error) {
    console.error("Create notification error:", error)
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notificationIds, markAs } = await request.json()

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Notification IDs array is required" },
        { status: 400 }
      )
    }

    // Update notifications one by one since Upstash Redis doesn't support pipeline
    for (const id of notificationIds) {
      const notificationKey = `notification:${id}`
      if (markAs === 'read') {
        await getRedisClient().hset(notificationKey, { read: true })
      } else if (markAs === 'unread') {
        await getRedisClient().hset(notificationKey, { read: false })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notifications marked as ${markAs}`,
    })
  } catch (error) {
    console.error("Update notification error:", error)
    return NextResponse.json(
      { error: "Failed to update notifications" },
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
    const notificationId = searchParams.get("id")

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      )
    }

    const notificationKey = `notification:${notificationId}`
    const notificationsKey = `user:${session.user.id}:notifications`

    // Remove notification
    await getRedisClient().del(notificationKey)

    return NextResponse.json({
      success: true,
      message: "Notification deleted",
    })
  } catch (error) {
    console.error("Delete notification error:", error)
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    )
  }
}