import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { client } from "@/lib/redis"

// Helper function to ensure Redis client is available
function getRedisClient() {
  if (!client) {
    throw new Error("Redis client not available")
  }
  return client
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check if user exists in Redis
          const userKey = `user:${credentials.email}`
          const existingUser = await getRedisClient().hgetall(userKey)

          if (existingUser && existingUser.email) {
            // In production, verify password hash
            return {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
            }
          }

          // Create new user for demo purposes
          // In production, you'd hash the password
          const newUser = {
            id: credentials.email as string,
            email: credentials.email as string,
            name: credentials.name as string || credentials.email as string,
          }

          // Store user in Redis
          await getRedisClient().hset(userKey, newUser)
          await getRedisClient().expire(userKey, 60 * 60 * 24 * 30) // 30 days expiry

          return newUser
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
  }
})