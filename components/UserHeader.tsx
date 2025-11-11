"use client"

import { useState } from "react"
import { useUser } from "@/contexts/UserContext"
import CyberButton from "./CyberButton"
import { useRouter } from "next/navigation"

export default function UserHeader() {
  const { user, logout, preferences } = useUser()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const router = useRouter()

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <CyberButton
          onClick={() => router.push("/auth/signin")}
          className="px-4 py-2 text-sm"
        >
          ACCESS SYSTEM
        </CyberButton>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* User Info */}
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-cyan-400 text-sm font-medium">
            {user.name}
          </p>
          <p className="text-gray-500 text-xs">
            {user.email}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold hover:from-cyan-400 hover:to-purple-500 transition-all transform hover:scale-105"
          >
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </button>

          {/* User Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-black/90 border border-cyan-500/30 rounded-lg shadow-xl z-50 backdrop-blur-sm">
              <div className="p-4 border-b border-cyan-500/20">
                <p className="text-cyan-400 font-medium">{user.name}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>

              <div className="p-2">
                <button
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full text-left px-3 py-2 text-cyan-300 hover:bg-cyan-950/50 rounded-md transition-colors text-sm"
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full text-left px-3 py-2 text-cyan-300 hover:bg-cyan-950/50 rounded-md transition-colors text-sm"
                >
                  ⭐ Favorites
                </button>
                <button
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full text-left px-3 py-2 text-cyan-300 hover:bg-cyan-950/50 rounded-md transition-colors text-sm"
                >
                  🏷️ Tags
                </button>
                <button
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full text-left px-3 py-2 text-cyan-300 hover:bg-cyan-950/50 rounded-md transition-colors text-sm"
                >
                  🔔 Notifications
                </button>
                <button
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full text-left px-3 py-2 text-cyan-300 hover:bg-cyan-950/50 rounded-md transition-colors text-sm"
                >
                  ⚙️ Settings
                </button>
                <hr className="my-2 border-cyan-500/20" />
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-950/50 rounded-md transition-colors text-sm"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </div>
  )
}