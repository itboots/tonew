"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FavoriteItem } from "@/types"
import CyberButton from "@/components/CyberButton"
import HologramPanel from "@/components/HologramPanel"
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
      setError("An error occurred while loading favorites")
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = async (itemId: string) => {
    if (!confirm("Remove this item from favorites?")) return

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
      setError("An error occurred while removing favorite")
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-black to-purple-950" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-cyan-500/20 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-cyan-400 hover:text-cyan-300">
                ← Main System
              </Link>
              <h1 className="text-2xl font-bold text-cyan-400">STARRED ITEMS</h1>
            </div>
            <div className="text-cyan-300">
              {favorites.length} items saved
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 border border-red-500 bg-red-950/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {favorites.length === 0 ? (
          <HologramPanel className="text-center py-16">
            <div className="text-cyan-400 text-6xl mb-4">⭐</div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">No Favorites Yet</h2>
            <p className="text-gray-400 mb-6">
              Start exploring and star items that interest you
            </p>
            <Link href="/">
              <CyberButton>Explore Content</CyberButton>
            </Link>
          </HologramPanel>
        ) : (
          <div className="space-y-4">
            {favorites.map((item) => (
              <HologramPanel key={item.id} className="p-6 hover:border-cyan-400/50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold text-cyan-400 hover:text-cyan-300">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {item.title}
                        </a>
                      </h3>
                      {item.category && (
                        <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-purple-300 text-xs">
                          {item.category}
                        </span>
                      )}
                      {item.importance && (
                        <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-300 text-xs">
                          Importance: {item.importance}/10
                        </span>
                      )}
                    </div>

                    <p className="text-gray-300 mb-3 line-clamp-2">{item.description}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Favorited: {new Date(item.favoritedAt).toLocaleDateString()}</span>
                      {item.publishDate && (
                        <span>Published: {new Date(item.publishDate).toLocaleDateString()}</span>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span>Tags:</span>
                          {item.tags.map((tag, index) => (
                            <span key={index} className="px-1 py-0.5 bg-cyan-500/20 rounded text-cyan-300 text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                        <p className="text-yellow-300 text-sm">Note: {item.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <CyberButton
                      onClick={() => removeFavorite(item.id)}
                      className="px-3 py-1 text-sm bg-red-500/20 border-red-500 hover:bg-red-500/30"
                    >
                      Remove
                    </CyberButton>
                  </div>
                </div>
              </HologramPanel>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}