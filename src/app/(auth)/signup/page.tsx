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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

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

  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([])

  // Update the handleOrganizationChange function
  const handleOrganizationChange = (orgId: string) => {
    let newSelected: string[]
    if (userType === 'integrator') {
      newSelected = selectedOrgs.includes(orgId)
        ? selectedOrgs.filter(id => id !== orgId)
        : [...selectedOrgs, orgId]
    } else {
      newSelected = [orgId]
    }
    setSelectedOrgs(newSelected)
    setFormData(prev => ({
      ...prev,
      organizations: newSelected
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900 p-4">
      <Card className="w-full max-w-md bg-[#111] border-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="space-y-6 pb-8">
          <div className="text-gray-400 text-center text-sm tracking-wider uppercase">[ Create New User ]</div>
          <CardTitle className="text-4xl font-bold text-center text-white bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            Create User Account
          </CardTitle>
          <p className="text-gray-400 text-center text-sm">
            Create a new user account with specified permissions
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200 block">Account Type</label>
              <Select 
                onValueChange={value => setUserType(value as 'normal' | 'admin' | 'integrator')}
                disabled={availableUserTypes.length === 1}
              >
                <SelectTrigger className="bg-[#1A1A1A] border-gray-800 text-gray-300 hover:bg-[#222] transition-colors">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-gray-800">
                  {availableUserTypes.map(type => (
                    <SelectItem 
                      key={type.id} 
                      value={type.id} 
                      className="text-gray-300 hover:bg-[#222] cursor-pointer"
                    >
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200 block">Username</label>
              <Input
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                className="bg-[#1A1A1A] border-gray-800 text-gray-300 placeholder:text-gray-500 hover:bg-[#222] focus:bg-[#222] transition-colors"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200 block">First Name</label>
                <Input
                  name="firstname"
                  type="text"
                  placeholder="First name"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="bg-[#1A1A1A] border-gray-800 text-gray-300 placeholder:text-gray-500 hover:bg-[#222] focus:bg-[#222] transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200 block">Last Name</label>
                <Input
                  name="lastname"
                  type="text"
                  placeholder="Last name"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="bg-[#1A1A1A] border-gray-800 text-gray-300 placeholder:text-gray-500 hover:bg-[#222] focus:bg-[#222] transition-colors"
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
              {userType === 'integrator' ? (
                <div className="relative">
                  <Select 
                    onValueChange={(value) => {
                      const newSelected = selectedOrgs.includes(value)
                        ? selectedOrgs.filter(id => id !== value)
                        : [...selectedOrgs, value]
                      setSelectedOrgs(newSelected)
                      setFormData(prev => ({
                        ...prev,
                        organizations: newSelected
                      }))
                    }}
                    value={selectedOrgs[selectedOrgs.length - 1] || ''}
                    disabled={isLoadingOrgs}
                  >
                    <SelectTrigger className="bg-[#1A1A1A] border-gray-800 text-gray-300">
                      <div className="flex flex-wrap gap-1">
                        {selectedOrgs.length > 0 ? (
                          selectedOrgs.map(orgId => {
                            const org = organizations.find(o => o._id === orgId)
                            return org && (
                              <Badge key={orgId} variant="secondary" className="mr-1">
                                {org.organizationName}
                              </Badge>
                            )
                          })
                        ) : (
                          <span className="text-gray-500">Select organizations...</span>
                        )}
                      </div>
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
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedOrgs.includes(org._id)}
                                readOnly
                                className="h-4 w-4"
                              />
                              <span>{org.organizationName}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-orgs" disabled className="text-gray-300">
                          No organizations available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedOrgs.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedOrgs.map(orgId => {
                        const org = organizations.find(o => o._id === orgId)
                        return org && (
                          <Badge 
                            key={orgId} 
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {org.organizationName}
                            <button
                              onClick={() => {
                                const newSelected = selectedOrgs.filter(id => id !== orgId)
                                setSelectedOrgs(newSelected)
                                setFormData(prev => ({
                                  ...prev,
                                  organizations: newSelected
                                }))
                              }}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Select 
                  onValueChange={value => handleOrganizationChange(value)}
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
              )}
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
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating}
            >
              {isCreating ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}