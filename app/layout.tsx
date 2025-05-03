import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import WarningSystem from "./components/WarningSystem"
import ContinuousBehaviorMonitor from "./components/ContinuousBehaviorMonitor"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Behavioral Analysis System",
  description: "Monitor user behavior and detect anomalies using AI",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ContinuousBehaviorMonitor />
          <WarningSystem />
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
