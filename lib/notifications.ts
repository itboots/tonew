import { client } from "@/lib/redis"
import { Notification } from "@/types"

export class NotificationService {
  private static instance: NotificationService
  private subscriptions: Map<string, Set<(notification: Notification) => void>> = new Map()

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Subscribe to notifications for a user
  subscribe(userId: string, callback: (notification: Notification) => void) {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Set())
    }
    this.subscriptions.get(userId)!.add(callback)

    // Start Redis subscription if not already started for this user
    this.startRedisSubscription(userId)

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(userId)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.subscriptions.delete(userId)
        }
      }
    }
  }

  private async startRedisSubscription(userId: string) {
    const channel = `user:${userId}:notifications`

    try {
      // Check if Redis client is available
      if (!client) {
        console.warn("⚠️ Redis客户端未配置，跳过实时通知订阅")
        return
      }

      // Create a new Redis client for subscription (regular clients can't subscribe)
      const subscriber = client.duplicate()
      await subscriber.connect()

      await subscriber.subscribe(channel, (message) => {
        try {
          const notification: Notification = JSON.parse(message)
          const callbacks = this.subscriptions.get(userId)
          if (callbacks) {
            callbacks.forEach(callback => callback(notification))
          }
        } catch (error) {
          console.error("Error parsing notification message:", error)
        }
      })
    } catch (error) {
      console.error("Error setting up Redis subscription:", error)
    }
  }

  // Send notification to a user
  async sendNotification(
    userId: string,
    type: 'new_content' | 'favorite_tag' | 'system',
    title: string,
    message: string,
    data?: any
  ): Promise<boolean> {
    try {
      // Check if Redis client is available
      if (!client) {
        console.warn("⚠️ Redis客户端未配置，跳过通知发送")
        return false
      }

      const notificationId = `${userId}:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const notificationKey = `notification:${notificationId}`
      const notificationsKey = `user:${userId}:notifications`

      const notification: Notification = {
        id: notificationId,
        userId,
        type,
        title,
        message,
        data: data || null,
        read: false,
        createdAt: new Date().toISOString(),
      }

      // Save notification
      await client.hset(notificationKey, notification)
      await client.zadd(notificationsKey, Date.now(), notificationId)

      // Set expiration (30 days)
      await client.expire(notificationKey, 60 * 60 * 24 * 30)
      await client.expire(notificationsKey, 60 * 60 * 24 * 30)

      // Publish to Redis pub/sub for real-time delivery
      await client.publish(`user:${userId}:notifications`, JSON.stringify(notification))

      return true
    } catch (error) {
      console.error("Error sending notification:", error)
      return false
    }
  }

  // Send notification for new content
  async notifyNewContent(userId: string, itemCount: number, categories?: string[]) {
    await this.sendNotification(
      userId,
      'new_content',
      'New Content Available',
      `${itemCount} new items found${categories ? ` in ${categories.join(', ')}` : ''}`,
      { itemCount, categories }
    )
  }

  // Send notification for tagged content
  async notifyTaggedContent(userId: string, tagName: string, itemCount: number) {
    await this.sendNotification(
      userId,
      'favorite_tag',
      `New ${tagName} Content`,
      `${itemCount} new items tagged with "${tagName}"`,
      { tag: tagName, itemCount }
    )
  }

  // Send system notification
  async notifySystem(userId: string, title: string, message: string) {
    await this.sendNotification(userId, 'system', title, message)
  }
}

export const notificationService = NotificationService.getInstance()