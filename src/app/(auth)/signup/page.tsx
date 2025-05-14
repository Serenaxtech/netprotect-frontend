"use client"

import { useState, useEffect } from "react"
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
import { useUserCreation } from "@/hooks/useUserCreation"
import { useOrganizations } from "@/hooks/useOrganizations"
import { toast } from "sonner"
import { AuthService } from "@/services/authService"

// Define all possible user types
const userTypes = [
  { id: 'normal', name: 'Normal User', endpoint: '/api/v1/user', allowedCreators: ['root', 'admin', 'integrator'] },
  { id: 'admin', name: 'Admin User', endpoint: '/api/v1/user/admin', allowedCreators: ['root', 'integrator'] },
  { id: 'integrator', name: 'Integrator', endpoint: '/api/v1/user/integrator', allowedCreators: ['root'] }
]

export default function SignupPage() {
  const router = useRouter()
  const { createUser, isLoading: isCreating, error: createError } = useUserCreation()
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const { organizations = [], isLoading: isLoadingOrgs, error: orgsError } = useOrganizations(currentUserRole)

  // Add console log to see organizations data
  // useEffect(() => {
  //   console.log('Organizations fetched:', organizations);
  // }, [organizations]);

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
  const [userType, setUserType] = useState<'normal' | 'admin' | 'integrator'>('normal')

  useEffect(() => {
    // Check current user's role
    const checkUserRole = async () => {
      try {
        const userData = await AuthService.checkAuth();
        if (!userData) {
          // If no user is logged in, redirect to login
          router.push('/login');
          return;
        }
        setCurrentUserRole(userData.role);
      } catch (error) {
        router.push('/login');
      }
    };
    
    checkUserRole();
  }, [router]);

  // Filter user types based on current user's role
  const availableUserTypes = userTypes.filter(type => 
    currentUserRole && type.allowedCreators.includes(currentUserRole)
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Update the handleOrganizationChange function
  const handleOrganizationChange = (value: string) => {
    // console.log('Selected organization:', value);
    setFormData(prev => ({
      ...prev,
      organizations: [value]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const success = await createUser(formData, userType)

      if (success) {
        toast.success("Account created", {
          description: "The account has been created successfully."
        })
        router.push('/dashboard')
      } else {
        toast.error("Error", {
          description: createError?.error || createError || "Failed to create account"
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    }
  }

  if (!currentUserRole) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Card className="w-full max-w-md bg-[#111] border-gray-800">
        <CardHeader className="space-y-6">
          <div className="text-gray-400 text-center">[ Create New User ]</div>
          <CardTitle className="text-4xl font-bold text-center text-white">
            Create User Account
          </CardTitle>
          <p className="text-gray-400 text-center">
            Create a new user account with specified permissions
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Account Type</label>
              <Select 
                onValueChange={value => setUserType(value as 'normal' | 'admin' | 'integrator')}
                disabled={availableUserTypes.length === 1}
              >
                <SelectTrigger className="bg-[#1A1A1A] border-gray-800 text-gray-300">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-gray-800">
                  {availableUserTypes.map(type => (
                    <SelectItem key={type.id} value={type.id} className="text-gray-300">
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Select 
                onValueChange={handleOrganizationChange}
                disabled={isLoadingOrgs}
              >
                <SelectTrigger className="bg-[#1A1A1A] border-gray-800 text-gray-300">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-gray-800">
                  {isLoadingOrgs ? (
                    <SelectItem value="loading" disabled className="text-gray-300">
                      Loading organizations...
                    </SelectItem>
                  ) : organizations && organizations.length > 0 ? (
                    organizations.map(org => (
                      <SelectItem 
                        key={org._id} 
                        value={org._id}
                        className="text-gray-300"
                      >
                        {org.organizationName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-orgs" disabled className="text-gray-300">
                      No organizations available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {orgsError && (
                <p className="text-sm text-red-500">
                  {orgsError}
                </p>
              )}
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
              disabled={isCreating}
            >
              {isCreating ? 'Creating Account...' : 'Create Account'}
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