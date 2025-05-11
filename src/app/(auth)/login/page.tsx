"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Card className="w-full max-w-md bg-[#111] border-gray-800">
        <CardHeader className="space-y-6">
          <div className="text-gray-400 text-center">[ Welcome Back ]</div>
          <CardTitle className="text-4xl font-bold text-center text-white">
            Sign in to NetProtect
          </CardTitle>
          <p className="text-gray-400 text-center">
            Enter your details to access your account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1A1A1A] border-gray-800 text-gray-300 placeholder:text-gray-500"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-200">
                  Password
                </label>
                <Link 
                  href="/forgot-password"
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#1A1A1A] border-gray-800 text-gray-300 placeholder:text-gray-500"
                required
              />
            </div>
            <Button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white border-2 border-red-600"
            >
              Sign in
            </Button>
            <div className="text-center text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-gray-300 hover:text-white">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}