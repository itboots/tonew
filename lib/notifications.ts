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
  // Note: Upstash Redis REST API doesn't support pub/sub subscriptions
  // Clients should poll for new notifications instead
  subscribe(userId: string, callback: (notification: Notification) => void) {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Set())
    }
    this.subscriptions.get(userId)!.add(callback)

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
      await client.hset(notificationKey, notification as unknown as Record<string, unknown>)
      await client.zadd(notificationsKey, { score: Date.now(), member: notificationId })

      // Set expiration (30 days)
      await client.expire(notificationKey, 60 * 60 * 24 * 30)
      await client.expire(notificationsKey, 60 * 60 * 24 * 30)

      // Note: Upstash Redis REST API doesn't support pub/sub
      // Clients should poll for notifications instead

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