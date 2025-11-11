"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Notification } from "@/types"
import { notificationService } from "@/lib/notifications"
import HologramPanel from "./HologramPanel"
import CyberButton from "./CyberButton"

export default function NotificationCenter() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load initial notifications
  useEffect(() => {
    if (session?.user) {
      loadNotifications()
    }
  }, [session])

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!session?.user?.email) return

    const unsubscribe = notificationService.subscribe(
      session.user.email,
      (notification: Notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep latest 50
        setUnreadCount(prev => prev + 1)
      }
    )

    return unsubscribe
  }, [session])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    if (!session?.user) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/notifications")
      const data = await response.json()

      if (data.success) {
        setNotifications(data.data || [])
        setUnreadCount(data.metadata?.unreadCount || 0)
      }
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds, markAs: "read" }),
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            notificationIds.includes(n.id) ? { ...n, read: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        if (notifications.find(n => n.id === notificationId)?.read === false) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  if (!session) {
    return null
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_content':
        return '📰'
      case 'favorite_tag':
        return '🏷️'
      case 'system':
        return '⚙️'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_content':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20'
      case 'favorite_tag':
        return 'text-purple-400 border-purple-500/30 bg-purple-950/20'
      case 'system':
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20'
      default:
        return 'text-gray-400 border-gray-500/30 bg-gray-950/20'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 border border-cyan-500/30 rounded-lg hover:border-cyan-400 hover:bg-cyan-950/30 transition-all"
      >
        <svg
          className="w-5 h-5 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-96 bg-black/95 border border-cyan-500/30 rounded-lg shadow-xl z-50 backdrop-blur-sm overflow-hidden">
          <HologramPanel className="p-0 h-full">
            {/* Header */}
            <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
              <h3 className="text-cyan-400 font-bold">NOTIFICATIONS</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <CyberButton
                    onClick={markAllAsRead}
                    className="px-3 py-1 text-xs bg-cyan-500/20 border-cyan-500 hover:bg-cyan-500/30"
                  >
                    Mark All Read
                  </CyberButton>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-cyan-400"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-cyan-400">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <div className="text-4xl mb-2">🔔</div>
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-cyan-500/10">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-cyan-950/20 transition-all cursor-pointer ${
                        !notification.read ? 'border-l-2 border-cyan-400' : ''
                      }`}
                      onClick={() => !notification.read && markAsRead([notification.id])}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-bold ${!notification.read ? 'text-cyan-400' : 'text-gray-300'}`}>
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="text-gray-500 hover:text-red-400 ml-2"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">
                            {notification.message}
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </HologramPanel>
        </div>
      )}
    </div>
  )
}