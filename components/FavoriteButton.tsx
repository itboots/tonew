"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext"
import { ValueItem } from "@/types"

interface FavoriteButtonProps {
  item: ValueItem
  className?: string
}

// 全局收藏缓存，避免每个按钮都请求一次
let favoriteCachePromise: Promise<Set<string>> | null = null
let favoriteCache: Set<string> | null = null

const getFavoriteIds = async (): Promise<Set<string>> => {
  // 如果缓存存在，直接返回
  if (favoriteCache) return favoriteCache

  // 如果正在加载，等待加载完成
  if (favoriteCachePromise) return favoriteCachePromise

  // 开始加载
  favoriteCachePromise = (async () => {
    try {
      const response = await fetch("/api/user/favorites")
      if (response.ok) {
        const data = await response.json()
        const ids = new Set<string>(data.data?.map((fav: any) => fav.id) || [])
        favoriteCache = ids
        return ids
      }
    } catch (error) {
      console.error("Failed to load favorites:", error)
    }
    return new Set<string>()
  })()

  return favoriteCachePromise
}

// 清除缓存函数
export const clearFavoriteCache = () => {
  favoriteCache = null
  favoriteCachePromise = null
}

export default function FavoriteButton({ item, className = "" }: FavoriteButtonProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  // 检查收藏状态
  useEffect(() => {
    if (!user) {
      setIsFavorited(false)
      return
    }

    const checkFavoriteStatus = async () => {
      const ids = await getFavoriteIds()
      setIsFavorited(ids.has(item.id))
    }

    checkFavoriteStatus()
  }, [user, item.id])

  const handleFavorite = async (e: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发卡片点击
    e.stopPropagation()
    e.preventDefault()

    if (!user) {
      alert("请先登录以使用收藏功能")
      return
    }

    setIsLoading(true)

    try {
      if (isFavorited) {
        // 取消收藏
        const response = await fetch(`/api/user/favorites?itemId=${item.id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setIsFavorited(false)
          favoriteCache?.delete(item.id)
          console.log("✅ 取消收藏成功")
        }
      } else {
        // 添加收藏
        const response = await fetch("/api/user/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item,
          }),
        })

        if (response.ok) {
          setIsFavorited(true)
          favoriteCache?.add(item.id)
          console.log("✅ 收藏成功")
        } else {
          const data = await response.json()
          if (data.error === "Item already favorited") {
            setIsFavorited(true)
            favoriteCache?.add(item.id)
          } else {
            alert("收藏失败：" + data.error)
          }
        }
      }
    } catch (error) {
      console.error("Failed to favorite item:", error)
      alert("操作失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          alert("请先登录以使用收藏功能")
        }}
        className={`p-1.5 sm:p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
        title="登录后使用"
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          style={{ color: 'var(--text-tertiary)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>
    )
  }

  return (
    <button
      onClick={handleFavorite}
      disabled={isLoading}
      className={`p-1.5 sm:p-2 rounded-lg transition-all transform hover:scale-110 ${
        isFavorited
          ? "bg-yellow-50 dark:bg-yellow-950/30"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      title={isFavorited ? "取消收藏" : "添加收藏"}
    >
      {isFavorited ? (
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          style={{ color: 'var(--apple-orange)' }}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          style={{ color: 'var(--text-tertiary)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )}
    </button>
  )
}