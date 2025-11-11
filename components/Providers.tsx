"use client"

import { SessionProvider } from "next-auth/react"
import { UserProvider } from "@/contexts/UserContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import PWARegister from "./PWARegister"

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <UserProvider>
        <ThemeProvider>
          <PWARegister />
          {children}
        </ThemeProvider>
      </UserProvider>
    </SessionProvider>
  )
}