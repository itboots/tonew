// 简化的认证系统
export interface User {
  id: string
  email: string
  name: string
}

export interface Session {
  user: User | null
  expires: string | null
}

let currentSession: Session | null = null

export async function auth(): Promise<Session | null> {
  // 检查是否在服务器端运行
  if (typeof window === 'undefined') {
    // 服务器端：暂时返回null，因为没有session管理
    return null
  }

  // 如果有缓存的session且未过期，返回它
  if (currentSession && currentSession.expires) {
    const expires = new Date(currentSession.expires)
    if (expires > new Date()) {
      return currentSession
    }
  }

  // 获取新的session
  try {
    const response = await fetch('/api/auth/session')
    if (response.ok) {
      currentSession = await response.json()
      return currentSession
    }
  } catch (error) {
    console.error('Failed to get session:', error)
  }

  return null
}

export async function signIn(credentials: {
  email: string
  password: string
  name?: string
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (response.ok) {
      currentSession = await response.json()
      return { success: true, user: currentSession?.user || undefined }
    } else {
      return { success: false, error: 'Invalid credentials' }
    }
  } catch (error) {
    return { success: false, error: 'Authentication failed' }
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch('/api/auth/session', {
      method: 'DELETE',
    })
  } catch (error) {
    console.error('Sign out error:', error)
  }

  currentSession = null
}

// 简化的客户端Hook
export function useSession() {
  return {
    data: currentSession,
    status: 'authenticated' as const,
    update: async () => {
      currentSession = await auth()
    }
  }
}