"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { auth as getAuth, signIn as simpleSignIn, signOut as simpleSignOut } from "@/lib/simple-auth"
import { User, UserPreferences } from "@/types"

interface UserContextType {
  user: User | null
  isLoading: boolean
  preferences: UserPreferences | null
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  login: (credentials: { email: string; password: string; name?: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadUserSession()
  }, [])

  const loadUserSession = async () => {
    setIsLoading(true)
    try {
      const session = await getAuth()
      if (session?.user) {
        setUser(session.user)

        // Load user preferences
        const mockPreferences: UserPreferences = {
          categories: [],
          notifications: true,
          theme: "cyberpunk",
          autoRefresh: true,
        }
        setPreferences(mockPreferences)
      }
    } catch (error) {
      console.error("Failed to load session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: { email: string; password: string; name?: string }) => {
    setIsLoading(true)
    try {
      const result = await simpleSignIn(credentials)
      if (result.success && result.user) {
        setUser(result.user)

        // Set default preferences
        const mockPreferences: UserPreferences = {
          categories: [],
          notifications: true,
          theme: "cyberpunk",
          autoRefresh: true,
        }
        setPreferences(mockPreferences)

        return { success: true }
      } else {
        return { success: false, error: result.error || "Login failed" }
      }
    } catch (error) {
      return { success: false, error: "Login failed" }
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user || !preferences) return

    setIsLoading(true)
    try {
      // Filter out undefined values and merge with existing preferences
      const filteredPrefs = Object.fromEntries(
        Object.entries(newPreferences).filter(([_, v]) => v !== undefined)
      ) as Partial<UserPreferences>

      const updatedPrefs: UserPreferences = { ...preferences, ...filteredPrefs }
      setPreferences(updatedPrefs)
    } catch (error) {
      console.error("Failed to update preferences:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await simpleSignOut()
      setUser(null)
      setPreferences(null)
      // Redirect to signin page
      window.location.href = "/auth/signin"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        preferences,
        updatePreferences,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}