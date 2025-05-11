"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Placeholder organizations data
const organizations = [
  {
    id: "67da9a2f3facef356427eaad",
    name: "Organization 1"
  },
  {
    id: "67da9a3d3facef356427eaaf",
    name: "Organization 2"
  }
]

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    phone_number: "",
    organizations: [],
    password: "",
    confirm_password: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleOrganizationChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      organizations: [value]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle signup logic here
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Card className="w-full max-w-md bg-[#111] border-gray-800">
        <CardHeader className="space-y-6">
          <div className="text-gray-400 text-center">[ Create Account ]</div>
          <CardTitle className="text-4xl font-bold text-center text-white">
            Sign up to NetProtect
          </CardTitle>
          <p className="text-gray-400 text-center">
            Enter your details to create your account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Username</label>
              <Input
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                className="bg-[#1A1A1A] border-gray-800 text-gray-300 placeholder:text-gray-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">First Name</label>
                <Input
                  name="firstname"
                  type="text"
                  placeholder="First name"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="bg-[#1A1A1A] border-gray-800 text-gray-300 placeholder:text-gray-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Last Name</label>
                <Input
                  name="lastname"
                  type="text"
                  placeholder="Last name"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="bg-[#1A1A1A] border-gray-800 text-gray-300 placeholder:text-gray-500"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Email Address</label>
              <Input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="bg-[#1A1A1A] border-gray-800 text-gray-300 placeholder:text-gray-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Phone Number</label>
              <Input
                name="phone_number"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone_number}
                onChange={handleChange}
                className="bg-[#1A1A1A] border-gray-800 text-gray-300 placeholder:text-gray-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Organization</label>
              <Select onValueChange={handleOrganizationChange}>
                <SelectTrigger className="bg-[#1A1A1A] border-gray-800 text-gray-300">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-gray-800">
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id} className="text-gray-300">
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Password</label>
              <Input
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="bg-[#1A1A1A] border-gray-800 text-gray-300 placeholder:text-gray-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Confirm Password</label>
              <Input
                name="confirm_password"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="bg-[#1A1A1A] border-gray-800 text-gray-300 placeholder:text-gray-500"
                required
              />
            </div>
            <Button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white border-2 border-red-600 mt-6"
            >
              Create Account
            </Button>
            <div className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-gray-300 hover:text-white">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}