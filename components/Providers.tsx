"use client"

import { UserProvider } from "@/contexts/UserContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import PWARegister from "./PWARegister"

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <UserProvider>
      <ThemeProvider>
        <PWARegister />
        {children}
      </ThemeProvider>
    </UserProvider>
  )
}