"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import CyberButton from "@/components/CyberButton"
import HologramPanel from "@/components/HologramPanel"
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
        setError(result.error || "Login failed")
      }
    } catch (error) {
      setError("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-black to-purple-950" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Sign In Form */}
      <div className="relative z-10 w-full max-w-md">
        <HologramPanel className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-cyan-400 mb-2 tracking-wider">
              {isSignUp ? "ACCESS GRANTED" : "SYSTEM LOGIN"}
            </h1>
            <p className="text-gray-400 text-sm">
              {isSignUp ? "Create new user credentials" : "Enter your credentials to access the system"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 border border-red-500 bg-red-950/50 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-cyan-400 text-sm font-medium mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-cyan-100 placeholder-cyan-800 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 transition-all"
                  placeholder="Enter your user ID"
                  required={!isSignUp}
                />
              </div>
            )}

            <div>
              <label className="block text-cyan-400 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-cyan-100 placeholder-cyan-800 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 transition-all"
                placeholder="user@system.com"
                required
              />
            </div>

            <div>
              <label className="block text-cyan-400 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-cyan-100 placeholder-cyan-800 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <CyberButton
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AUTHENTICATING...
                </span>
              ) : (
                <span>{isSignUp ? "CREATE ACCOUNT" : "ACCESS SYSTEM"}</span>
              )}
            </CyberButton>
          </form>

          {/* Toggle Sign In/Up */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
              >
                {isSignUp ? "SIGN IN" : "SIGN UP"}
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-purple-400 hover:text-purple-300 text-sm underline transition-colors"
            >
              ← Back to Main System
            </Link>
          </div>
        </HologramPanel>
      </div>
    </div>
  )
}