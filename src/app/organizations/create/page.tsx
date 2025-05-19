'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useOrganizationCreation } from '@/hooks/useOrganizationCreation';
import { useAuthCheck } from '@/hooks/useAuthCheck';

export default function CreateOrganizationPage() {
  const { isAuthorized, isLoading } = useAuthCheck({ allowedRoles: ['root'] });
  const { createOrganization, isLoading: isCreatingOrg, error: orgError } = useOrganizationCreation();
  const [formData, setFormData] = useState({
    admin_email: '',
    organization_name: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await createOrganization({
        organizationName: formData.organization_name,
        adminEmail: formData.admin_email
      });
      if (success) {
        toast.success("Organization created", {
          description: "The organization has been created successfully."
        });
        setFormData({ admin_email: '', organization_name: '' });
      } else {
        toast.error("Error", {
          description: orgError || "Failed to create organization"
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <Card className="bg-[#111] max-w-2xl mx-auto border-gray-800 shadow-lg">
      <CardHeader className="space-y-4">
        <div className="text-gray-400 text-center text-sm">[ Create New Organization ]</div>
        <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white">
          Create Organization
        </CardTitle>
        <p className="text-gray-400 text-center text-sm md:text-base">
          Create a new organization to manage agents and users
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Organization Name</label>
            <Input
              name="organization_name"
              type="text"
              placeholder="Enter organization name"
              value={formData.organization_name}
              onChange={handleFormChange}
              className="bg-[#1A1A1A] border-gray-800 text-gray-300 placeholder:text-gray-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Admin Email</label>
            <Input
              name="admin_email"
              type="email"
              placeholder="Enter admin email"
              value={formData.admin_email}
              onChange={handleFormChange}
              className="bg-[#1A1A1A] border-gray-800 text-gray-300 placeholder:text-gray-500"
              required
            />
          </div>
          <Button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white border-2 border-red-600 mt-6"
            disabled={isCreatingOrg}
          >
            {isCreatingOrg ? 'Creating Organization...' : 'Create Organization'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}