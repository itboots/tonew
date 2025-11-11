"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { UserPreferences } from "@/types"

interface User {
  id: string
  email: string
  name: string | null
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  preferences: UserPreferences | null
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
  login: (credentials: { email: string; password: string; name?: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadUserSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUser(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setPreferences(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadUserSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // 不等待 loadUser 完成，避免阻塞
        loadUser(session.user)
      } else {
        // 没有 session 时也要设置 isLoading 为 false
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Failed to load session:", error)
      setIsLoading(false)
    }
  }

  const loadUser = async (supabaseUser: SupabaseUser) => {
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
    })

    // 用户信息已加载，结束 loading 状态
    setIsLoading(false)

    // 异步加载用户偏好，不阻塞
    loadPreferences(supabaseUser.id)
  }

  const loadPreferences = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('theme, auto_refresh')
        .eq('id', userId)
        .maybeSingle() // 使用 maybeSingle 代替 single，没有记录时返回 null 而不是错误

      // 如果没有记录，创建默认配置
      if (!data) {
        console.log('No user profile found, creating default...')

        // 尝试创建默认配置
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            theme: 'apple',
            auto_refresh: true,
          })

        if (insertError) {
          console.error('Failed to create profile:', insertError)
        }

        // 设置默认偏好
        setPreferences({
          categories: [],
          notifications: true,
          theme: 'apple',
          autoRefresh: true,
        })
        return
      }

      if (error) {
        console.error('Failed to load preferences:', error)
        // 设置默认偏好
        setPreferences({
          categories: [],
          notifications: true,
          theme: 'apple',
          autoRefresh: true,
        })
        return
      }

      setPreferences({
        categories: [],
        notifications: true,
        theme: data.theme || 'apple',
        autoRefresh: data.auto_refresh ?? true,
      })
    } catch (error) {
      console.error('Failed to load preferences:', error)
      // 设置默认偏好
      setPreferences({
        categories: [],
        notifications: true,
        theme: 'apple',
        autoRefresh: true,
      })
    }
  }

  const login = async (credentials: { email: string; password: string; name?: string }) => {
    setIsLoading(true)
    try {
      // 判断是登录还是注册
      if (credentials.name) {
        // 注册新用户
        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              name: credentials.name,
            },
          },
        })

        if (error) {
          return { success: false, error: error.message || '注册失败' }
        }

        if (data.user) {
          return { success: true }
        }

        return { success: false, error: '注册失败' }
      } else {
        // 登录
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error) {
          return { success: false, error: error.message || '登录失败' }
        }

        if (data.user) {
          return { success: true }
        }

        return { success: false, error: '登录失败' }
      }
    } catch (error: any) {
      return { success: false, error: error.message || '认证失败' }
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user || !preferences) return

    try {
      // 过滤掉 undefined 值
      const filteredPrefs = Object.fromEntries(
        Object.entries(newPreferences).filter(([_, v]) => v !== undefined)
      ) as Partial<UserPreferences>

      const updatedPrefs: UserPreferences = { ...preferences, ...filteredPrefs }

      // 更新本地状态
      setPreferences(updatedPrefs)

      // 保存到 Supabase
      const { error } = await supabase
        .from('user_profiles')
        .update({
          theme: updatedPrefs.theme,
          auto_refresh: updatedPrefs.autoRefresh,
        })
        .eq('id', user.id)

      if (error) {
        console.error('Failed to update preferences:', error)
        // 如果更新失败，尝试插入（可能是首次设置）
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            theme: updatedPrefs.theme,
            auto_refresh: updatedPrefs.autoRefresh,
          })

        if (insertError) {
          console.error('Failed to insert preferences:', insertError)
        }
      }
    } catch (error) {
      console.error("Failed to update preferences:", error)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setPreferences(null)
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
