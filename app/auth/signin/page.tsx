"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"

export default function SignInPage() {
  const { login } = useUser()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("demo123")
  const [name, setName] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login({
        email,
        password,
        name: isSignUp ? name : undefined,
      })

      if (result.success) {
        router.push("/")
      } else {
        setError(result.error || "登录失败")
      }
    } catch (error) {
      setError("发生错误，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* 登录表单 */}
      <div className="w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl" style={{
            backgroundColor: 'var(--apple-blue)'
          }}>
            📱
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {isSignUp ? "创建账号" : "欢迎回来"}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isSignUp ? "注册新账号开始使用" : "登录以继续浏览"}
          </p>
        </div>

        {/* 登录卡片 */}
        <div className="apple-card-large p-6 sm:p-8">
          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-3 rounded-xl" style={{
              backgroundColor: 'rgba(255, 59, 48, 0.1)',
              border: '1px solid var(--apple-red)'
            }}>
              <p className="text-sm text-center" style={{ color: 'var(--apple-red)' }}>{error}</p>
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  用户名
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="apple-input w-full"
                  placeholder="输入你的用户名"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                邮箱地址
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="apple-input w-full"
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="apple-input w-full"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full apple-button py-3 text-base font-semibold mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isSignUp ? "注册中..." : "登录中..."}
                </span>
              ) : (
                <span>{isSignUp ? "注册" : "登录"}</span>
              )}
            </button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isSignUp ? "已有账号？" : "还没有账号？"}{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium transition-colors"
                style={{ color: 'var(--apple-blue)' }}
              >
                {isSignUp ? "立即登录" : "立即注册"}
              </button>
            </p>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium transition-colors inline-flex items-center gap-1"
            style={{ color: 'var(--apple-blue)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
        </div>

        {/* 演示提示 */}
        <div className="mt-6 p-4 rounded-2xl" style={{
          backgroundColor: 'var(--gray-1)',
          border: '1px solid var(--gray-3)'
        }}>
          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
            💡 提示：这是演示环境，输入任意邮箱和密码即可登录
          </p>
        </div>
      </div>
    </div>
  )
}