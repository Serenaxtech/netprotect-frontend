"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { AuthService } from "@/services/authService"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading, error } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const isAuthenticated = await AuthService.checkAuth();
      if (isAuthenticated) {
        router.push('/dashboard');
      }
    };
    
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const success = await login(email, password)
      
      if (success) {
        toast.success("Login successful", {
          description: "Welcome back!"
        })
      } else {
        toast.error("Login failed", {
          description: error || "Invalid credentials"
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred"
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-lg">
        <Card className="bg-[#111] border-gray-800 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="text-gray-400 text-center text-sm">[ Welcome Back ]</div>
            <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white">
              Sign in to NetProtect
            </CardTitle>
            <p className="text-gray-400 text-center text-sm md:text-base">
              Enter your details to access your account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
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
    </div>
  );
}