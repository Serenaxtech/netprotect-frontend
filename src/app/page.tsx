"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import MovingCircuits from '@/components/MovingCircuits'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black p-8 text-center overflow-hidden">
      {/* Circuit Animation Background */}
      <MovingCircuits />

      {/* Main Content with Glassmorphism */}
      <div className="relative z-10 max-w-3xl space-y-8 backdrop-blur-sm bg-black/30 p-12 rounded-2xl border border-gray-800/50">
        <div className="text-gray-400 text-center animate-pulse">[ Welcome to NetProtect ]</div>
        <h1 className="text-6xl font-bold tracking-tight text-white sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-600 to-red-700 animate-gradient">
          NetProtect Dashboard
        </h1>
        <p className="text-xl text-gray-400 animate-fade-in">
          Advanced network security agent with real-time protection
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild 
            className="bg-red-600 hover:bg-red-700 text-white border-2 border-red-600 transition-all duration-300 hover:scale-105"
            size="lg"
          >
            <Link href="/login">Sign in</Link>
          </Button>
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="border-gray-800 bg-[#1A1A1A] text-gray-300 hover:bg-[#222] hover:text-white transition-all duration-300 hover:scale-105"
          >
            <Link href="/signup">Create account</Link>
          </Button>
        </div>
      </div>

      {/* Floating Security Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="security-particles"></div>
      </div>
    </main>
  )
}