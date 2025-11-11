"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FavoriteItem } from "@/types"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    loadFavorites()
  }, [session, status, router])

  const loadFavorites = async () => {
    try {
      const response = await fetch("/api/user/favorites")
      const data = await response.json()

      if (data.success) {
        setFavorites(data.data || [])
      } else {
        setError(data.error || "Failed to load favorites")
      }
    } catch (error) {
      setError("网络请求失败")
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = async (itemId: string) => {
    if (!confirm("确定要取消收藏吗？")) return

    try {
      const response = await fetch(`/api/user/favorites?itemId=${itemId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.id !== itemId))
      } else {
        const data = await response.json()
        setError(data.error || "Failed to remove favorite")
      }
    } catch (error) {
      setError("操作失败，请重试")
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="加载中..." />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* 导航栏 */}
      <nav className="apple-nav sticky top-0 z-50 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--apple-blue)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
          <h1 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            我的收藏
          </h1>
          <div className="w-20" />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 rounded-2xl" style={{
            backgroundColor: 'rgba(255, 59, 48, 0.1)',
            border: '1px solid var(--apple-red)'
          }}>
            <p style={{ color: 'var(--apple-red)' }}>{error}</p>
          </div>
        )}

        {/* 统计信息 */}
        {favorites.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              共 {favorites.length} 个收藏
            </div>
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="apple-card-large p-12 text-center">
            <div className="text-5xl mb-4">⭐</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              暂无收藏
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              发现感兴趣的内容，点击收藏按钮添加到这里
            </p>
            <Link href="/" className="inline-block apple-button px-6 py-2.5">
              开始浏览
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((item) => (
              <div key={item.id} className="apple-card p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-0"
                  >
                    {/* 分类和重要性 */}
                    <div className="flex items-center gap-2 mb-2">
                      {item.category && (
                        <span className="apple-badge apple-badge-blue text-xs">
                          {item.category}
                        </span>
                      )}
                      {item.importance && (
                        <span className="apple-badge apple-badge-orange text-xs">
                          重要度: {item.importance}/10
                        </span>
                      )}
                    </div>

                    {/* 标题 */}
                    <h3
                      className="text-base font-semibold mb-1 hover:underline line-clamp-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.title}
                    </h3>

                    {/* 描述 */}
                    {item.description && (
                      <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-tertiary)' }}>
                        {item.description}
                      </p>
                    )}

                    {/* 标签 */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap mb-2">
                        {item.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'var(--gray-1)',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 备注 */}
                    {item.notes && (
                      <div className="mt-2 p-2 rounded-lg" style={{
                        backgroundColor: 'rgba(255, 204, 0, 0.1)',
                        border: '1px solid rgba(255, 204, 0, 0.3)'
                      }}>
                        <p className="text-sm" style={{ color: 'var(--apple-yellow)' }}>
                          📝 {item.notes}
                        </p>
                      </div>
                    )}

                    {/* 收藏时间 */}
                    <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        收藏于 {new Date(item.favoritedAt).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {item.publishDate && (
                        <>
                          <span>•</span>
                          <span>发布于 {new Date(item.publishDate).toLocaleDateString('zh-CN')}</span>
                        </>
                      )}
                    </div>
                  </a>

                  {/* 删除按钮 */}
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-2)]"
                    style={{ color: 'var(--apple-red)' }}
                    title="取消收藏"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}