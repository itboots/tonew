"use client"

import { useState } from "react"
import { useUser } from "@/contexts/UserContext"
import { ValueItem } from "@/types"

interface FavoriteButtonProps {
  item: ValueItem
  className?: string
}

export default function FavoriteButton({ item, className = "" }: FavoriteButtonProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const handleFavorite = async () => {
    if (!user) {
      console.log("Please sign in to favorite items")
      return
    }

    setIsLoading(true)

    try {
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
        // Show success feedback
        setTimeout(() => setIsFavorited(false), 2000)
      } else {
        const data = await response.json()
        if (data.error === "Item already favorited") {
          setIsFavorited(true)
          setTimeout(() => setIsFavorited(false), 2000)
        }
      }
    } catch (error) {
      console.error("Failed to favorite item:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <button
        onClick={() => console.log("Sign in to favorite")}
        className={`p-2 border border-gray-600 rounded-lg hover:border-cyan-500 hover:bg-cyan-950/30 transition-all group ${className}`}
        title="Sign in to favorite"
      >
        <svg
          className="w-5 h-5 text-gray-500 group-hover:text-cyan-400"
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
      disabled={isLoading || isFavorited}
      className={`p-2 border rounded-lg transition-all transform hover:scale-105 ${
        isFavorited
          ? "border-yellow-500 bg-yellow-950/50"
          : "border-gray-600 hover:border-cyan-500 hover:bg-cyan-950/30"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      title={isFavorited ? "Favorited!" : "Add to favorites"}
    >
      {isFavorited ? (
        <svg
          className="w-5 h-5 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-gray-500 hover:text-cyan-400"
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