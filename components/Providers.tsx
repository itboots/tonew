"use client"

import { SessionProvider } from "next-auth/react"
import { UserProvider } from "@/contexts/UserContext"

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </SessionProvider>
  )
}